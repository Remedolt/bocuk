import { ARENA } from './constants';
import type { Assets } from './Assets';
import type { WeaponDef, WeaponId } from './types';

export class Projectile {
  alive = false;
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  damage = 0;
  radius = 4;
  life = 0;
  pierce = 0;
  angle = 0;
  kind: WeaponId = 'pistol';
  glow = '#ffe08a';
  hitIds = new Set<number>();

  spawn(x: number, y: number, angle: number, def: WeaponDef, damageMul: number): void {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.vx = Math.cos(angle) * def.projectileSpeed;
    this.vy = Math.sin(angle) * def.projectileSpeed;
    this.damage = def.damage * damageMul;
    this.radius = def.projectileRadius;
    this.life = 1.15;
    this.pierce = def.pierce;
    this.kind = def.id;
    this.glow = def.glow;
    this.hitIds.clear();
  }

  update(dt: number): void {
    if (!this.alive) return;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    const bound = ARENA.size / 2;
    if (this.life <= 0 || Math.abs(this.x) > bound || Math.abs(this.y) > bound) {
      this.alive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D, _assets: Assets): void {
    if (!this.alive) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    this.drawRound(ctx);
    ctx.restore();
  }

  private drawRound(ctx: CanvasRenderingContext2D): void {
    if (this.kind === 'plasma') {
      const r = Math.max(7, this.radius);
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, r);
      g.addColorStop(0, '#f4fff8');
      g.addColorStop(0.35, '#2dffb4');
      g.addColorStop(0.75, 'rgba(20, 140, 100, 0.55)');
      g.addColorStop(1, 'rgba(10, 80, 60, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(-r * 0.18, -r * 0.18, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (this.kind === 'shotgun') {
      const r = Math.max(2.4, this.radius);
      ctx.fillStyle = 'rgba(28, 20, 10, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.35, r * 0.4, r * 1.05, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, 0.2, 0, 0, r);
      g.addColorStop(0, '#ece8e0');
      g.addColorStop(0.4, '#9a9690');
      g.addColorStop(1, '#3c3a36');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,16,12,0.55)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      return;
    }

    const sniper = this.kind === 'sniper';
    const hot = this.kind === 'minigun';
    const s = sniper ? 1.25 : hot ? 0.88 : 1;
    const half = 1.55 * s;
    const caseLen = 7.5 * s;
    const tipLen = 6.5 * s;
    const trail = sniper ? 26 : hot ? 20 : 16;

    const trailGrad = ctx.createLinearGradient(-trail, 0, 0, 0);
    if (sniper) {
      trailGrad.addColorStop(0, 'rgba(180, 220, 255, 0)');
      trailGrad.addColorStop(1, 'rgba(210, 235, 255, 0.7)');
    } else {
      trailGrad.addColorStop(0, 'rgba(255, 120, 20, 0)');
      trailGrad.addColorStop(0.55, 'rgba(255, 170, 40, 0.55)');
      trailGrad.addColorStop(1, 'rgba(255, 230, 160, 0.9)');
    }
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = sniper ? 1.6 : 1.35;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-trail, 0);
    ctx.lineTo(-1, 0);
    ctx.stroke();

    ctx.fillStyle = '#c89620';
    ctx.beginPath();
    ctx.roundRect(-caseLen, -half, caseLen + 0.4, half * 2, 0.4);
    ctx.fill();
    ctx.fillStyle = '#8a6010';
    ctx.fillRect(-caseLen, -half, 1.2 * s, half * 2);
    ctx.fillStyle = '#5a3c0c';
    ctx.fillRect(-1.4 * s, -half, 1.1 * s, half * 2);

    ctx.fillStyle = '#b87333';
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(2.2 * s, -half * 0.92);
    ctx.quadraticCurveTo(tipLen, 0, 2.2 * s, half * 0.92);
    ctx.lineTo(0, half);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8a4a1c';
    ctx.beginPath();
    ctx.moveTo(2.2 * s, -half * 0.55);
    ctx.quadraticCurveTo(tipLen * 0.92, 0, 2.2 * s, half * 0.55);
    ctx.lineTo(1.2 * s, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,245,210,0.45)';
    ctx.fillRect(-caseLen + 1.6 * s, -half * 0.55, caseLen * 0.55, half * 0.45);
  }
}

export class ProjectilePool {
  readonly items: Projectile[] = [];

  spawn(x: number, y: number, angle: number, def: WeaponDef, damageMul: number): Projectile {
    let p = this.items.find((item) => !item.alive);
    if (!p) {
      p = new Projectile();
      this.items.push(p);
    }
    p.spawn(x, y, angle, def, damageMul);
    return p;
  }

  update(dt: number): void {
    for (const p of this.items) p.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D, assets: Assets): void {
    for (const p of this.items) p.draw(ctx, assets);
  }

  clear(): void {
    for (const p of this.items) p.alive = false;
  }
}
