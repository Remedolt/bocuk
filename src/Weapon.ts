import { PLAYER } from './constants';
import { distSq } from './math';
import type { Enemy } from './Enemy';
import type { ProjectilePool } from './Projectile';
import type { WeaponDef, WeaponId } from './types';

export class Weapon {
  x = 0;
  y = 0;
  aim = 0;
  cooldown = 0;
  flash = 0;

  constructor(readonly def: WeaponDef) {}

  update(
    dt: number,
    px: number,
    py: number,
    orbitAngle: number,
    slotIndex: number,
    slotCount: number,
  ): void {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.flash = Math.max(0, this.flash - dt);
    const a = orbitAngle + (slotIndex / Math.max(slotCount, 1)) * Math.PI * 2;
    this.x = px + Math.cos(a) * PLAYER.orbitRadius;
    this.y = py + Math.sin(a) * PLAYER.orbitRadius;
    this.aim = a;
  }

  nearest(enemies: Enemy[]): Enemy | null {
    const rangeSq = this.def.range * this.def.range;
    let best: Enemy | null = null;
    let bestD = rangeSq;
    for (const e of enemies) {
      if (!e.alive) continue;
      const d = distSq(this.x, this.y, e.x, e.y);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  tryFire(pool: ProjectilePool, target: Enemy, damageMul: number): boolean {
    if (this.cooldown > 0) return false;
    this.aim = Math.atan2(target.y - this.y, target.x - this.x);
    const pellets = this.def.pellets;
    for (let i = 0; i < pellets; i += 1) {
      const t = pellets === 1 ? 0 : (i / (pellets - 1) - 0.5);
      const ang = this.aim + t * this.def.spread + (Math.random() - 0.5) * this.def.spread * 0.25;
      pool.spawn(
        this.x + Math.cos(ang) * 18,
        this.y + Math.sin(ang) * 18,
        ang,
        this.def,
        damageMul,
      );
    }
    this.cooldown = this.def.fireInterval;
    this.flash = 0.09;
    return true;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.aim);
    ctx.scale(1.85, 1.85);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(2, 10, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = this.def.glow;
    ctx.shadowBlur = this.flash > 0 ? 22 : 10;
    this.drawBody(ctx);
    ctx.shadowBlur = 0;

    if (this.flash > 0) {
      const t = this.flash / 0.09;
      ctx.fillStyle = `rgba(255, 240, 160, ${0.9 * t})`;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(34, -7 * t);
      ctx.lineTo(42 + 10 * t, 0);
      ctx.lineTo(34, 7 * t);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private drawBody(ctx: CanvasRenderingContext2D): void {
    const id: WeaponId = this.def.id;
    if (id === 'smg') this.smg(ctx);
    else if (id === 'shotgun') this.shotgun(ctx);
    else if (id === 'sniper') this.sniper(ctx);
    else if (id === 'plasma') this.plasma(ctx);
    else if (id === 'minigun') this.minigun(ctx);
    else this.pistol(ctx);
  }

  private ink(ctx: CanvasRenderingContext2D): void {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = '#140c08';
  }

  private pistol(ctx: CanvasRenderingContext2D): void {
    this.ink(ctx);
    ctx.fillStyle = '#5a4538';
    ctx.beginPath();
    ctx.roundRect(-14, 2, 9, 14, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.def.color;
    ctx.beginPath();
    ctx.roundRect(-12, -7, 28, 12, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.def.glow;
    ctx.fillRect(12, -4, 10, 6);
    ctx.strokeRect(12, -4, 10, 6);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(20, -6, 3, 10);
  }

  private smg(ctx: CanvasRenderingContext2D): void {
    this.ink(ctx);
    ctx.fillStyle = '#3a3a36';
    ctx.beginPath();
    ctx.roundRect(-6, 4, 7, 16, 1);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.def.color;
    ctx.beginPath();
    ctx.roundRect(-16, -8, 36, 13, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2a2a28';
    for (let i = 0; i < 5; i += 1) ctx.fillRect(-2 + i * 5, -6, 2, 8);
    ctx.fillStyle = this.def.glow;
    ctx.fillRect(16, -5, 12, 7);
  }

  private shotgun(ctx: CanvasRenderingContext2D): void {
    this.ink(ctx);
    ctx.fillStyle = '#6b3a1e';
    ctx.beginPath();
    ctx.roundRect(-18, -6, 14, 14, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.def.color;
    ctx.beginPath();
    ctx.roundRect(-6, -10, 32, 8, 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(-6, 0, 32, 8, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.def.glow;
    ctx.fillRect(24, -10, 6, 8);
    ctx.fillRect(24, 0, 6, 8);
  }

  private sniper(ctx: CanvasRenderingContext2D): void {
    this.ink(ctx);
    ctx.fillStyle = this.def.color;
    ctx.beginPath();
    ctx.roundRect(-22, -5, 48, 10, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1c2830';
    ctx.fillRect(8, -4, 26, 8);
    ctx.strokeRect(8, -4, 26, 8);
    ctx.fillStyle = this.def.glow;
    ctx.beginPath();
    ctx.arc(-2, -12, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0b1520';
    ctx.beginPath();
    ctx.arc(-2, -12, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.def.glow;
    ctx.fillRect(32, -3, 10, 6);
  }

  private plasma(ctx: CanvasRenderingContext2D): void {
    this.ink(ctx);
    ctx.fillStyle = '#17332c';
    ctx.beginPath();
    ctx.roundRect(-16, -8, 18, 16, 4);
    ctx.fill();
    ctx.stroke();
    const g = ctx.createRadialGradient(10, 0, 2, 10, 0, 14);
    g.addColorStop(0, '#e8fff4');
    g.addColorStop(0.4, this.def.glow);
    g.addColorStop(1, '#0a4a3a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(12, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = this.def.glow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22, -8);
    ctx.lineTo(30, -4);
    ctx.moveTo(22, 8);
    ctx.lineTo(30, 4);
    ctx.stroke();
  }

  private minigun(ctx: CanvasRenderingContext2D): void {
    this.ink(ctx);
    ctx.fillStyle = '#3a3228';
    ctx.beginPath();
    ctx.roundRect(-18, -10, 16, 20, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.def.color;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.roundRect(-4, i * 7 - 3, 30, 6, 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = this.def.glow;
    ctx.fillRect(24, -10, 6, 20);
  }
}
