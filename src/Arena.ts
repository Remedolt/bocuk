import { ARENA, ARENA_THEMES, themeIndexForWave } from './constants';
import { hash2 } from './math';
import type { Assets } from './Assets';
import type { Camera } from './Camera';
import type { ArenaTheme } from './types';

export class Arena {
  readonly half = ARENA.size / 2;
  theme: ArenaTheme = ARENA_THEMES[0]!;

  setWave(wave: number): void {
    this.theme = ARENA_THEMES[themeIndexForWave(wave)]!;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, assets: Assets): void {
    const floor = assets.get('floor');
    const tile = ARENA.tile;
    const pad = camera.visibleRadius() + tile;
    const x0 = Math.floor((camera.x - pad) / tile);
    const y0 = Math.floor((camera.y - pad) / tile);
    const x1 = Math.ceil((camera.x + pad) / tile);
    const y1 = Math.ceil((camera.y + pad) / tile);
    const minT = Math.floor(-this.half / tile);
    const maxT = Math.ceil(this.half / tile);
    const [fr, fg, fb] = this.theme.floor;

    for (let iy = y0; iy <= y1; iy += 1) {
      if (iy < minT || iy > maxT) continue;
      for (let ix = x0; ix <= x1; ix += 1) {
        if (ix < minT || ix > maxT) continue;
        const x = ix * tile;
        const y = iy * tile;
        if (floor) {
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.drawImage(floor, x, y, tile, tile);
          ctx.globalAlpha = 1;
          ctx.fillStyle = `rgba(${fr}, ${fg}, ${fb}, 0.45)`;
          ctx.fillRect(x, y, tile + 1, tile + 1);
          ctx.restore();
        } else {
          const n = hash2(ix, iy);
          const shade = Math.floor(n * 18);
          ctx.fillStyle = `rgb(${fr + shade}, ${fg + shade}, ${fb + Math.floor(shade * 0.6)})`;
          ctx.fillRect(x, y, tile + 1, tile + 1);
          if (n > 0.72) {
            ctx.strokeStyle = this.theme.accent;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 8, y + tile * n);
            ctx.lineTo(x + tile - 6, y + tile * (1 - n));
            ctx.stroke();
          }
          ctx.strokeStyle = 'rgba(0,0,0,0.28)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, tile, tile);
        }
      }
    }

    ctx.strokeStyle = this.theme.wall;
    ctx.lineWidth = ARENA.wall;
    ctx.strokeRect(-this.half, -this.half, ARENA.size, ARENA.size);
    ctx.strokeStyle = this.theme.wallInner;
    ctx.lineWidth = 4;
    ctx.strokeRect(-this.half + 18, -this.half + 18, ARENA.size - 36, ARENA.size - 36);
  }
}
