import { CAMERA } from './constants';
import { lerp } from './math';

export class Camera {
  x = 0;
  y = 0;
  zoom = CAMERA.zoom;
  shake = 0;
  viewW = 1;
  viewH = 1;

  resize(viewW: number, viewH: number): void {
    this.viewW = viewW;
    this.viewH = viewH;
  }

  follow(tx: number, ty: number, dt: number): void {
    const k = 1 - Math.exp(-CAMERA.follow * dt);
    this.x = lerp(this.x, tx, k);
    this.y = lerp(this.y, ty, k);
    this.shake = Math.max(0, this.shake - dt * 22);
  }

  bump(amount: number): void {
    this.shake = Math.max(this.shake, amount);
  }

  apply(ctx: CanvasRenderingContext2D): void {
    const jx = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    const jy = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    ctx.translate(this.viewW / 2 + jx, this.viewH / 2 + jy);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  visibleRadius(): number {
    return Math.hypot(this.viewW, this.viewH) / (2 * this.zoom);
  }
}
