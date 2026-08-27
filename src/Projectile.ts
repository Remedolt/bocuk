import { ARENA } from './constants';
import { drawSprite } from './draw';
import type { Assets } from './Assets';
import type { WeaponDef } from './types';

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
  color = '#fff';
  glow = '#fff';
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
    this.color = def.color;
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

  draw(ctx: CanvasRenderingContext2D, assets: Assets): void {
    if (!this.alive) return;
    drawSprite(ctx, assets.get('projectile'), this.x, this.y, this.radius * 4, this.radius * 2.2, this.angle, () => {
      ctx.strokeStyle = this.glow;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = this.radius * 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(4, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    });
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
