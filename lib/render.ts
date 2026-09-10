import type { RepoStarsInfo } from './github';
import {
  defaultConfig,
  drawFrameOnCanvas,
  getTotalFrames,
  type AnimationConfig,
} from './animation';

function avatarProxyUrl(originalUrl: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const proxyBase = `${supabaseUrl}/functions/v1/github-proxy/avatar`;
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${proxyBase}?url=${encodedUrl}`;
}

export function getProxiedAvatarUrl(originalUrl: string): string {
  return avatarProxyUrl(originalUrl);
}

export function loadAvatarCORS(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let settled = false;

    const finish = (result: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        finish(img);
      } else {
        finish(null);
      }
    };

    img.onerror = () => finish(null);

    setTimeout(() => finish(null), 15000);

    img.src = avatarProxyUrl(url);
  });
}

export async function preloadAvatarsForRender(
  urls: string[],
): Promise<Map<string, HTMLImageElement>> {
  const map = new Map<string, HTMLImageElement>();
  const results = await Promise.all(urls.map((u) => loadAvatarCORS(u)));
  for (let i = 0; i < urls.length; i++) {
    if (results[i]) {
      map.set(urls[i], results[i]!);
    }
  }
  return map;
}

export type RenderProgress = (progress: number) => void;

export async function renderVideo(
  info: RepoStarsInfo,
  options?: {
    config?: Partial<AnimationConfig>;
    onProgress?: RenderProgress;
    signal?: AbortSignal;
  },
): Promise<Blob> {
  const config = { ...defaultConfig, ...options?.config };
  const { onProgress, signal } = options ?? {};

  const avatarUrls = info.contributors.map((s) => s.avatarUrl);
  const avatars = await preloadAvatarsForRender(avatarUrls);
  const ownerAvatar = await loadAvatarCORS(info.userAvatarUrl);

  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;

  const totalFrames = getTotalFrames(config);
  const fps = config.fps;

  const mimeType = getSupportedMimeType();

  // 0 fps = manual mode: the stream only emits a frame when we call
  // track.requestFrame() ourselves. This avoids the real-time-clock
  // drift that captureStream(fps) causes (duplicated/dropped frames),
  // which is what was making the downloaded video look jerky.
  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };
  });

  recorder.start();

  let frame = 0;

  await new Promise<void>((resolve) => {
    function renderFrame() {
      if (signal?.aborted) {
        resolve();
        return;
      }

      drawFrameOnCanvas(canvas, {
        frame,
        info,
        avatars,
        ownerAvatar,
        config,
      });

      // Manually capture exactly this frame, independent of real time.
      track.requestFrame();

      if (onProgress) {
        onProgress(frame / totalFrames);
      }

      frame++;

      if (frame >= totalFrames) {
        resolve();
      } else {
        // requestAnimationFrame paces more consistently with the
        // browser's own render/composite cycle than setTimeout.
        requestAnimationFrame(renderFrame);
      }
    }
    renderFrame();
  });

  // Give the last frame time to be captured before stopping.
  track.requestFrame();
  await new Promise((r) => setTimeout(r, 300));
  recorder.stop();

  return done;
}

function getSupportedMimeType(): string {
  const types = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=h264',
    'video/mp4',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return 'video/webm';
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function getFileExtension(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'mp4';
  return 'webm';
}