import { ARENA, ENEMY_DEFS } from './constants';
import { drawShadow, drawSprite } from './draw';
import { clamp } from './math';
import type { Assets } from './Assets';
import type { EnemyKind } from './types';
import type { Player } from './Player';

let nextId = 1;

export class Enemy {
  id = 0;
  kind: EnemyKind = 'walker';
  x = 0;
  y = 0;
  angle = 0;
  radius = 16;
  hp = 1;
  maxHp = 1;
  speed = 80;
  damage = 8;
  xp = 3;
  color = '#8d9568';
  eye = '#ff2a12';
  spriteSize = 46;
  alive = false;
  attackCd = 0;
  hitFlash = 0;

  spawn(kind: EnemyKind, x: number, y: number, wave: number): void {
    const def = ENEMY_DEFS[kind];
    const hpScale = 1 + (wave - 1) * 0.2;
    const spdScale = 1 + (wave - 1) * 0.045;
    this.id = nextId++;
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.radius = def.radius;
    this.maxHp = Math.round(def.hp * hpScale);
    this.hp = this.maxHp;
    this.speed = def.speed * spdScale;
    this.damage = Math.round(def.damage * (1 + (wave - 1) * 0.08));
    this.xp = def.xp + Math.floor(wave / 2);
    this.color = def.color;
    this.eye = def.eye;
    this.spriteSize = def.spriteSize;
    this.alive = true;
    this.attackCd = 0;
    this.hitFlash = 0;
  }

  update(dt: number, player: Player): void {
    if (!this.alive) return;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const len = Math.hypot(dx, dy) || 1;
    this.angle = Math.atan2(dy, dx);
    this.x += (dx / len) * this.speed * dt;
    this.y += (dy / len) * this.speed * dt;
    const limit = ARENA.size / 2 - this.radius;
    this.x = clamp(this.x, -limit, limit);
    this.y = clamp(this.y, -limit, limit);
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt);
  }

  hurt(amount: number): { killed: boolean; xp: number } {
    if (!this.alive) return { killed: false, xp: 0 };
    this.hp -= amount;
    this.hitFlash = 0.08;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      return { killed: true, xp: this.xp };
    }
    return { killed: false, xp: 0 };
  }

  draw(ctx: CanvasRenderingContext2D, assets: Assets): void {
    if (!this.alive) return;
    drawShadow(ctx, this.x, this.y, this.radius * 1.1, this.radius * 0.5);
    const img = assets.enemy(this.kind);
    drawSprite(ctx, img, this.x, this.y, this.spriteSize, this.spriteSize, this.angle, () => {
      this.drawFallback(ctx);
    });
    if (this.hp < this.maxHp) this.drawHp(ctx);
  }

  private drawFallback(ctx: CanvasRenderingContext2D): void {
    const r = this.radius;
    ctx.fillStyle = this.hitFlash > 0 ? '#f2e8d8' : this.color;
    ctx.beginPath();
    ctx.ellipse(0, 2, r * 0.85, r * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3a332c';
    ctx.beginPath();
    ctx.ellipse(-r * 0.55, -r * 0.15, r * 0.28, r * 0.7, 0.4, 0, Math.PI * 2);
    ctx.ellipse(r * 0.55, -r * 0.15, r * 0.28, r * 0.7, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6e7a58';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.55, r * 0.48, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.eye;
    ctx.beginPath();
    ctx.arc(-r * 0.16, -r * 0.58, 2.4, 0, Math.PI * 2);
    ctx.arc(r * 0.16, -r * 0.58, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHp(ctx: CanvasRenderingContext2D): void {
    const w = Math.max(22, this.radius * 2);
    const x = this.x - w / 2;
    const y = this.y - this.radius - 12;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y, w, 3);
    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(x, y, w * (this.hp / this.maxHp), 3);
  }
}

export class EnemyPool {
  readonly items: Enemy[] = [];

  spawn(kind: EnemyKind, x: number, y: number, wave: number): Enemy {
    let e = this.items.find((item) => !item.alive);
    if (!e) {
      e = new Enemy();
      this.items.push(e);
    }
    e.spawn(kind, x, y, wave);
    return e;
  }

  living(): Enemy[] {
    return this.items.filter((e) => e.alive);
  }

  count(): number {
    let n = 0;
    for (const e of this.items) if (e.alive) n += 1;
    return n;
  }

  clear(): void {
    for (const e of this.items) e.alive = false;
  }
}
