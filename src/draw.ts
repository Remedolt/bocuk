/** Shared canvas helpers. Sprites face "up" (-Y) in source art. */
export const SPRITE_UP = -Math.PI / 2;

export function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
  ctx.beginPath();
  ctx.ellipse(x, y + 6, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  angle: number,
  fallback: () => void,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle - SPRITE_UP);
  if (image && image.naturalWidth > 0) {
    ctx.drawImage(image, -w / 2, -h / 2, w, h);
  } else {
    fallback();
  }
  ctx.restore();
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
