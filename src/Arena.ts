import { ARENA, ARENA_THEMES, themeIndexForWave } from './constants';
import { hash2 } from './math';
import type { Assets } from './Assets';
import type { Camera } from './Camera';
import type { ArenaTheme } from './types';

const PATTERN = ARENA.tile * 4;

export class Arena {
  readonly half = ARENA.size / 2;
  theme: ArenaTheme = ARENA_THEMES[0]!;
  private floorCanvas: HTMLCanvasElement | null = null;
  private floorPattern: CanvasPattern | null = null;
  private patternCtx: CanvasRenderingContext2D | null = null;
  private bakedTheme = '';
  private bakedFloorKey = '';

  setWave(wave: number): void {
    this.theme = ARENA_THEMES[themeIndexForWave(wave)]!;
  }

  private bakeFloor(assets: Assets): void {
    const floor = assets.get('floor');
    const key = `${this.theme.name}|${floor ? floor.src : 'none'}`;
    if (this.floorCanvas && this.bakedTheme === key) return;

    const tile = ARENA.tile;
    const canvas = this.floorCanvas ?? document.createElement('canvas');
    canvas.width = PATTERN;
    canvas.height = PATTERN;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const [fr, fg, fb] = this.theme.floor;
    ctx.fillStyle = `rgb(${fr}, ${fg}, ${fb})`;
    ctx.fillRect(0, 0, PATTERN, PATTERN);

    for (let iy = 0; iy < 4; iy += 1) {
      for (let ix = 0; ix < 4; ix += 1) {
        const x = ix * tile;
        const y = iy * tile;
        const n = hash2(ix + 17, iy + 31);
        const shade = Math.floor((n - 0.5) * 28);
        const r = Math.max(0, Math.min(255, fr + shade));
        const g = Math.max(0, Math.min(255, fg + shade));
        const b = Math.max(0, Math.min(255, fb + Math.floor(shade * 0.55)));

        if (floor) {
          ctx.globalAlpha = 0.72;
          ctx.drawImage(floor, x, y, tile, tile);
          ctx.globalAlpha = 1;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.38)`;
          ctx.fillRect(x, y, tile, tile);
        } else {
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x, y, tile, tile);
        }

        // Soft grit
        ctx.fillStyle = `rgba(0,0,0,${0.04 + n * 0.08})`;
        for (let k = 0; k < 5; k += 1) {
          const px = x + hash2(ix * 3 + k, iy * 5) * tile;
          const py = y + hash2(ix * 7 + k, iy * 11) * tile;
          ctx.fillRect(px, py, 1.5 + n * 2, 1.5 + n);
        }

        // Occasional stain / crack
        if (n > 0.62) {
          ctx.strokeStyle = this.theme.accent;
          ctx.lineWidth = 1.6 + n;
          ctx.beginPath();
          ctx.moveTo(x + 6, y + tile * (0.2 + n * 0.5));
          ctx.quadraticCurveTo(
            x + tile * 0.5,
            y + tile * (0.8 - n * 0.4),
            x + tile - 8,
            y + tile * (0.35 + n * 0.3),
          );
          ctx.stroke();
        }
        if (n > 0.82) {
          ctx.fillStyle = `rgba(255,255,255,${0.03 + n * 0.04})`;
          ctx.beginPath();
          ctx.ellipse(x + tile * 0.55, y + tile * 0.4, 10 + n * 14, 6 + n * 8, n, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.strokeStyle = 'rgba(0,0,0,0.22)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, tile - 1, tile - 1);
      }
    }

    // Light vignette inside pattern cell (subtle, tiles OK)
    const vg = ctx.createRadialGradient(
      PATTERN / 2,
      PATTERN / 2,
      PATTERN * 0.15,
      PATTERN / 2,
      PATTERN / 2,
      PATTERN * 0.72,
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, PATTERN, PATTERN);

    this.floorCanvas = canvas;
    this.bakedTheme = key;
    this.floorPattern = null;
    this.patternCtx = null;
    this.bakedFloorKey = key;
  }

  private patternFor(ctx: CanvasRenderingContext2D): CanvasPattern | null {
    if (!this.floorCanvas) return null;
    if (this.floorPattern && this.patternCtx === ctx) return this.floorPattern;
    this.floorPattern = ctx.createPattern(this.floorCanvas, 'repeat');
    this.patternCtx = ctx;
    return this.floorPattern;
  }

  draw(ctx: CanvasRenderingContext2D, _camera: Camera, assets: Assets): void {
    this.bakeFloor(assets);
    const pat = this.patternFor(ctx);
    const size = ARENA.size;
    const h = this.half;

    ctx.save();
    if (pat) {
      ctx.fillStyle = pat;
      ctx.translate(-h, -h);
      ctx.fillRect(0, 0, size, size);
      ctx.translate(h, h);
    } else {
      const [fr, fg, fb] = this.theme.floor;
      ctx.fillStyle = `rgb(${fr}, ${fg}, ${fb})`;
      ctx.fillRect(-h, -h, size, size);
    }

    // Outer void / arena rim
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(-h - 80, -h - 80, size + 160, 80);
    ctx.fillRect(-h - 80, h, size + 160, 80);
    ctx.fillRect(-h - 80, -h, 80, size);
    ctx.fillRect(h, -h, 80, size);

    // Thick wall band
    ctx.strokeStyle = this.theme.wall;
    ctx.lineWidth = ARENA.wall;
    ctx.lineJoin = 'round';
    ctx.strokeRect(-h, -h, size, size);

    ctx.strokeStyle = this.theme.wallInner;
    ctx.lineWidth = 5;
    ctx.strokeRect(-h + 16, -h + 16, size - 32, size - 32);

    // Corner posts for depth
    const post = 18;
    const inset = 10;
    ctx.fillStyle = this.theme.wall;
    for (const [sx, sy] of [
      [-h + inset, -h + inset],
      [h - inset - post, -h + inset],
      [-h + inset, h - inset - post],
      [h - inset - post, h - inset - post],
    ] as const) {
      ctx.fillRect(sx, sy, post, post);
      ctx.fillStyle = this.theme.wallInner;
      ctx.fillRect(sx + 3, sy + 3, post - 6, post - 6);
      ctx.fillStyle = this.theme.wall;
    }

    ctx.restore();
    void this.bakedFloorKey;
  }
}
