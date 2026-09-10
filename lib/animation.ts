import type { RepoStarsInfo } from './github';

export interface AnimationConfig {
  width: number;
  height: number;
  fps: number;
  durationInSeconds: number;
}

export const defaultConfig: AnimationConfig = {
  width: 1280,
  height: 720,
  fps: 30,
  durationInSeconds: 5,
};

const AVATAR_SIZE = 128;
const AVATAR_GAP = 16;
const STAR_SIZE = 32;
const PADDING = 64;

const FALLBACK_COLORS: [string, string][] = [
  ['#f59e0b', '#d97706'],
  ['#6366f1', '#4f46e5'],
  ['#ec4899', '#db2777'],
  ['#14b8a6', '#0d9488'],
  ['#f97316', '#ea580c'],
  ['#8b5cf6', '#7c3aed'],
  ['#06b6d4', '#0891b2'],
  ['#84cc16', '#65a30d'],
];

function getFallbackColors(i: number): [string, string] {
  return FALLBACK_COLORS[i % FALLBACK_COLORS.length];
}

function getInitials(login: string): string {
  const clean = login.replace(/[0-9]/g, '').replace(/-/g, '');
  return clean.slice(0, 2).toUpperCase();
}

function drawFallbackAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  index: number,
  login: string,
): void {
  const [colorA, colorB] = getFallbackColors(index);
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  const grad = ctx.createLinearGradient(
    cx - size / 2, cy - size / 2,
    cx + size / 2, cy + size / 2,
  );
  grad.addColorStop(0, colorA);
  grad.addColorStop(1, colorB);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw initials
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = getCanvasFont(700, size * 0.35);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(getInitials(login), cx, cy + 2);
  ctx.restore();
}

// Easing bezier approximating Easing.elastic(1) from Remotion
function elasticOut(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// Bezier easing approximating Easing.bezier(0.5, 1, 0.5, 1) — ease-out
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export interface RenderState {
  frame: number;
  info: RepoStarsInfo;
  avatars: Map<string, HTMLImageElement>;
  ownerAvatar: HTMLImageElement | null;
  config: AnimationConfig;
}

export function getTotalFrames(config: AnimationConfig): number {
  return config.durationInSeconds * config.fps;
}

function getCanvasFont(weight: number, size: number): string {
  if (typeof window === 'undefined') return `${weight} ${size}px system-ui, sans-serif`;
  const sansVar = getComputedStyle(document.body).getPropertyValue('--font-geist-sans').trim();
  const fontFamily = sansVar || 'system-ui';
  return `${weight} ${size}px ${fontFamily}, system-ui, sans-serif`;
}

export function drawFrameOnCanvas(
  canvas: HTMLCanvasElement,
  state: RenderState,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { frame, info, avatars, ownerAvatar, config } = state;
  const { width, height } = config;
  const progress = Math.min(
    frame / (config.durationInSeconds * config.fps),
    1,
  );

  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  // White background (matching reference)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  drawRepoInfo(ctx, info, ownerAvatar, width, progress);
  drawContributors(ctx, info, avatars, width, height, frame, config);
  drawStarCount(ctx, info.stars, width, height, frame, config);
}

function drawRepoInfo(
  ctx: CanvasRenderingContext2D,
  info: RepoStarsInfo,
  ownerAvatar: HTMLImageElement | null,
  width: number,
  progress: number,
): void {
  const padding = PADDING;
  const maxFontSize = 72;
  const minFontSize = 28;

  ctx.save();
  ctx.globalAlpha = Math.min(progress * 3, 1);
  ctx.textBaseline = 'alphabetic';

  // Available width for avatar + text (leave padding on both sides)
  const maxTotalWidth = width - padding * 2;

  // Find a font size where avatar + user + " / " + repo fits in maxTotalWidth
  let fontSize = maxFontSize;
  let avatarSize = 0;
  let userWidth = 0;
  let sepWidth = 0;
  let repoWidth = 0;

  while (fontSize >= minFontSize) {
    avatarSize = Math.floor(fontSize * 1.2);

    ctx.font = getCanvasFont(400, fontSize);
    userWidth = ctx.measureText(info.user).width;
    sepWidth = ctx.measureText(' / ').width;

    ctx.font = getCanvasFont(700, fontSize);
    repoWidth = ctx.measureText(info.repository).width;

    const textGap = fontSize * 0.25;
    const totalWidth = avatarSize + textGap + userWidth + sepWidth + repoWidth;

    if (totalWidth <= maxTotalWidth || fontSize <= minFontSize) {
      break;
    }

    fontSize -= 2;
  }

  const y = padding + fontSize * 0.35;
  const avatarX = padding;
  const avatarY = y - avatarSize * 0.75;

  // Owner avatar
  if (ownerAvatar && ownerAvatar.complete && ownerAvatar.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2,
      0,
      Math.PI * 2,
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(ownerAvatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();
  } else {
    drawFallbackAvatar(ctx, avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize, 0, info.user);
  }

  // Text
  const textX = avatarX + avatarSize + fontSize * 0.25;
  ctx.font = getCanvasFont(400, fontSize);
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'alphabetic';

  // User name
  ctx.fillText(info.user, textX, y);

  // Separator
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillText(' / ', textX + userWidth, y);

  // Repository name (bold)
  ctx.font = getCanvasFont(700, fontSize);
  ctx.fillStyle = '#000000';
  ctx.fillText(info.repository, textX + userWidth + sepWidth, y);

  ctx.restore();
}

function drawContributors(
  ctx: CanvasRenderingContext2D,
  info: RepoStarsInfo,
  avatars: Map<string, HTMLImageElement>,
  width: number,
  height: number,
  frame: number,
  config: AnimationConfig,
): void {
  const { contributors } = info;
  if (contributors.length === 0) return;

  const avatarSize = AVATAR_SIZE;
  const gap = AVATAR_GAP;
  const unit = avatarSize + gap;
  const startY = height * 0.40;

  // Interpolate left position with a smooth ease-out (no bounce/overshoot,
  // so avatars don't appear to jump/jerk into place at the start).
  const t = Math.min(frame / (config.durationInSeconds * config.fps), 1);
  const eased = easeOutExpo(t);

  ctx.save();

  for (let i = 0; i < contributors.length; i++) {
    const sg = contributors[i];
    const offset = gap + i * unit;
    const left = offset + (eased - 1) * 0 +
      (offset - contributors.length * unit + (width * 3) / 4 - offset) * eased;

    // Only draw if visible
    if (left > width + avatarSize || left < -avatarSize - STAR_SIZE) {
      continue;
    }

    // Avatar
    const img = avatars.get(sg.avatarUrl);
    const hasImage = img && img.complete && img.naturalWidth > 0;
    const cx = left + avatarSize / 2;
    const cy = startY + avatarSize / 2;

    if (hasImage) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.shadowColor = 'transparent';
      ctx.drawImage(img, left, startY, avatarSize, avatarSize);
      ctx.restore();
    } else {
      drawFallbackAvatar(ctx, cx, cy, avatarSize, i, sg.login);
    }

    // Star below avatar
    const starY = startY + avatarSize + 16;
    ctx.save();
    ctx.shadowColor = 'transparent';
    drawStarSvg(ctx, left + avatarSize / 2, starY + STAR_SIZE / 2, STAR_SIZE);
    ctx.restore();
  }

  ctx.restore();
}

function drawStarSvg(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
): void {
  // Star polygon points matching the reference SVG (lucide star)
  const points = [
    [12, 2], [15.09, 8.26], [22, 9.27], [17, 14.14],
    [18.18, 21.02], [12, 17.77], [5.82, 21.02], [7, 14.14],
    [2, 9.27], [8.91, 8.26],
  ];

  const scale = size / 24;
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const px = cx + (points[i][0] - 12) * scale;
    const py = cy + (points[i][1] - 12) * scale;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawStarCount(
  ctx: CanvasRenderingContext2D,
  stars: number,
  width: number,
  height: number,
  frame: number,
  config: AnimationConfig,
): void {
  // Count up faster than the full video duration — reaches the final
  // number in ~2s (or the full duration if it's shorter than that),
  // then holds steady for the rest of the video.
  const countDurationSeconds = Math.min(2, config.durationInSeconds);
  const countFrames = countDurationSeconds * config.fps;
  const t = Math.min(frame / countFrames, 1);
  const eased = easeOutExpo(t);
  const displayStars = Math.round(stars * eased);
  const text = displayStars.toLocaleString('en-US');

  ctx.save();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';

  const x = width - PADDING;
  const y = height - PADDING;

  // "stars" label width
  ctx.font = getCanvasFont(400, 128);
  const starsLabel = ' stars';
  const labelWidth = ctx.measureText(starsLabel).width;

  // Number (bold)
  ctx.font = getCanvasFont(700, 128);
  ctx.fillStyle = '#000000';
  ctx.fillText(text, x - labelWidth, y);

  // "stars" label
  ctx.font = getCanvasFont(400, 128);
  ctx.fillStyle = '#000000';
  ctx.fillText(starsLabel, x, y);

  ctx.restore();
}