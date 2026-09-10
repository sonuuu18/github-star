"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  defaultConfig,
  drawFrameOnCanvas,
  getTotalFrames,
  type AnimationConfig,
} from "@/lib/animation";
import { loadAvatarCORS, preloadAvatarsForRender } from "@/lib/render";
import type { RepoStarsInfo } from "@/lib/github";
import Loader from "./icons/loader";

interface PreviewPlayerProps {
  info: RepoStarsInfo;
  config?: Partial<AnimationConfig>;
  className?: string;
}

export function PreviewPlayer({ info, config, className }: PreviewPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [loading, setLoading] = useState(true);
  const avatarsRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const ownerAvatarRef = useRef<HTMLImageElement | null>(null);
  const infoRef = useRef(info);

  const mergedConfig: AnimationConfig = { ...defaultConfig, ...config };
  const totalFrames = getTotalFrames(mergedConfig);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const urls = info.contributors.map((s) => s.avatarUrl);
      const avatars = await preloadAvatarsForRender(urls);
      const ownerAvatar = await loadAvatarCORS(info.userAvatarUrl);

      if (cancelled) return;
      avatarsRef.current = avatars;
      ownerAvatarRef.current = ownerAvatar;
      infoRef.current = info;
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [info]);

  const renderLoop = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const totalDurationMs = totalFrames * (1000 / mergedConfig.fps);

      // Loop the animation with a brief pause at the end
      const loopedTime = elapsed % (totalDurationMs + 1000);

      const frame = Math.floor((loopedTime / 1000) * mergedConfig.fps);

      drawFrameOnCanvas(canvas, {
        frame,
        info: infoRef.current,
        avatars: avatarsRef.current,
        ownerAvatar: ownerAvatarRef.current,
        config: mergedConfig,
      });

      rafRef.current = requestAnimationFrame(renderLoop);
    },
    [mergedConfig, totalFrames],
  );

  useEffect(() => {
    if (loading) return;

    startTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [loading, renderLoop]);

  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{
        aspectRatio: `${mergedConfig.width} / ${mergedConfig.height}`,
      }}
    >
      <canvas
        ref={canvasRef}
        width={mergedConfig.width}
        height={mergedConfig.height}
        className="h-full w-full rounded-xl"
      />
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-md dark:bg-zinc-950/70">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200/60 bg-white/80 px-6 py-5 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <Loader />
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Creating your video
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                This may take a moment…
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
