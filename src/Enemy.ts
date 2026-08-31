import { ARENA, ENEMY_DEFS, WAVE } from './constants';
import { drawShadow, drawSprite } from './draw';
import { clamp } from './math';
import type { Assets } from './Assets';
import type { EnemyBoltPool } from './EnemyBolt';
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
  walk = 0;
  wave = 1;
  shotCd = 0;
  dashT = 0;
  dashCd = 0;

  spawn(kind: EnemyKind, x: number, y: number, wave: number): void {
    const def = ENEMY_DEFS[kind];
    const hard = WAVE.difficulty;
    const hpScale = (1 + (wave - 1) * 0.2) * hard;
    const spdScale = (1 + (wave - 1) * 0.045) * (kind === 'boss' ? 1 : 1.04);
    this.id = nextId++;
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.radius = def.radius;
    this.maxHp = Math.round(def.hp * hpScale);
    this.hp = this.maxHp;
    this.speed = def.speed * spdScale;
    this.damage = Math.round(def.damage * hard * (1 + (wave - 1) * 0.08));
    this.xp = def.xp + Math.floor(wave / 2) + (kind === 'boss' ? wave * 4 : 0);
    this.color = def.color;
    this.eye = def.eye;
    this.spriteSize = def.spriteSize;
    this.alive = true;
    this.attackCd = 0;
    this.hitFlash = 0;
    this.walk = Math.random() * Math.PI * 2;
    this.wave = wave;
    this.shotCd = 0.4 + Math.random() * 0.8;
    this.dashT = 0;
    this.dashCd = 0.6;
  }

  update(dt: number, player: Player): void {
    if (!this.alive) return;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const len = Math.hypot(dx, dy) || 1;
    this.angle = Math.atan2(dy, dx);
    let spd = this.speed;
    if (this.kind === 'boss') {
      this.dashCd = Math.max(0, this.dashCd - dt);
      if (this.dashT > 0) {
        this.dashT -= dt;
        spd *= 3.6;
      } else if (this.dashCd <= 0 && len > 90) {
        this.dashT = 0.38;
        this.dashCd = 1.35;
      }
    }
    this.x += (dx / len) * spd * dt;
    this.y += (dy / len) * spd * dt;
    const limit = ARENA.size / 2 - this.radius;
    this.x = clamp(this.x, -limit, limit);
    this.y = clamp(this.y, -limit, limit);
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.shotCd = Math.max(0, this.shotCd - dt);
    this.walk += dt * (this.kind === 'boss' ? 14 : 10);
  }

  tryShoot(bolts: EnemyBoltPool, player: Player): void {
    if (!this.alive || this.shotCd > 0) return;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx);
    const dmg = Math.max(4, Math.round(this.damage * 0.55));

    if (this.kind === 'boss') {
      if (dist > 560) return;
      this.shotCd = 0.82;
      for (const spread of [-0.34, 0, 0.34]) {
        bolts.spawn(this.x, this.y, ang + spread, 'fire', dmg, 320);
      }
      return;
    }
    if (this.kind === 'spitter' && this.wave >= 3) {
      if (dist > 420 || dist < 50) return;
      this.shotCd = 1.25;
      bolts.spawn(this.x, this.y, ang, 'spit', dmg, 240);
      return;
    }
    if (this.kind === 'wasp' && this.wave >= 4) {
      if (dist > 380 || dist < 40) return;
      this.shotCd = 1.45;
      bolts.spawn(this.x, this.y, ang, 'acid', Math.round(dmg * 0.85), 300);
      return;
    }
    if (this.kind === 'beetle' && this.wave >= 5) {
      if (dist > 340 || dist < 60) return;
      this.shotCd = 1.9;
      bolts.spawn(this.x, this.y, ang, 'fire', dmg, 220);
      return;
    }
    if (this.kind === 'tank' && this.wave >= 5) {
      if (dist > 400 || dist < 70) return;
      this.shotCd = 1.7;
      bolts.spawn(this.x, this.y, ang, 'fire', Math.round(dmg * 1.1), 200);
      return;
    }
    if (this.kind === 'walker' && this.wave >= 8) {
      if (dist > 280 || dist < 50) return;
      this.shotCd = 2.4;
      bolts.spawn(this.x, this.y, ang, 'spit', Math.round(dmg * 0.7), 200);
    }
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
      this.drawKind(ctx);
    });
    if (this.kind === 'boss' || this.hp < this.maxHp) this.drawHp(ctx);
  }

  private drawKind(ctx: CanvasRenderingContext2D): void {
    const r = this.radius;
    const flash = this.hitFlash > 0;
    const body = flash ? '#f2e8d8' : this.color;
    const kick = Math.sin(this.walk) * 0.18;

    if (this.kind === 'boss') {
      ctx.fillStyle = '#2a0810';
      ctx.beginPath();
      ctx.ellipse(0, 8, r * 1.05, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.05, r * 0.92, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a2030';
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.15, r * 0.72, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe14a';
      ctx.beginPath();
      ctx.moveTo(-r * 0.55, -r * 0.55);
      ctx.lineTo(-r * 0.28, -r * 1.15);
      ctx.lineTo(-0.08 * r, -r * 0.55);
      ctx.moveTo(r * 0.55, -r * 0.55);
      ctx.lineTo(r * 0.28, -r * 1.15);
      ctx.lineTo(0.08 * r, -r * 0.55);
      ctx.moveTo(0, -r * 0.62);
      ctx.lineTo(0, -r * 1.28);
      ctx.lineTo(r * 0.18, -r * 0.62);
      ctx.fill();
      ctx.fillStyle = this.eye;
      ctx.beginPath();
      ctx.arc(-r * 0.28, -r * 0.12, 5, 0, Math.PI * 2);
      ctx.arc(r * 0.28, -r * 0.12, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#140408';
      ctx.beginPath();
      ctx.arc(-r * 0.28, -r * 0.12, 2, 0, Math.PI * 2);
      ctx.arc(r * 0.28, -r * 0.12, 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (this.kind === 'runner') {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.55, r * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3a2a10';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.35, r * 0.2);
      ctx.lineTo(-r * 0.95, r * 0.85 + kick * 8);
      ctx.moveTo(r * 0.35, r * 0.2);
      ctx.lineTo(r * 0.95, r * 0.85 - kick * 8);
      ctx.stroke();
      ctx.fillStyle = this.eye;
      ctx.beginPath();
      ctx.arc(-3, -r * 0.55, 2.4, 0, Math.PI * 2);
      ctx.arc(3, -r * 0.55, 2.4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (this.kind === 'beetle') {
      ctx.fillStyle = '#2a1810';
      ctx.beginPath();
      ctx.ellipse(0, 6, r * 0.7, r * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.95, r * 0.78, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.6);
      ctx.lineTo(0, r * 0.55);
      ctx.stroke();
      ctx.fillStyle = '#1a1008';
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.55, r * 0.4, r * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = this.eye;
      ctx.beginPath();
      ctx.arc(-4, -r * 0.55, 2.2, 0, Math.PI * 2);
      ctx.arc(4, -r * 0.55, 2.2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (this.kind === 'wasp') {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#e8f0ff';
      ctx.beginPath();
      ctx.ellipse(-r * 0.15, 2, r * 0.85, r * 0.35, -0.4 + kick, 0, Math.PI * 2);
      ctx.ellipse(r * 0.15, 2, r * 0.85, r * 0.35, 0.4 - kick, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 2, r * 0.42, r * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1208';
      ctx.fillRect(-r * 0.2, -2, r * 0.4, 3);
      ctx.fillRect(-r * 0.2, 6, r * 0.4, 3);
      ctx.fillStyle = '#3a2a10';
      ctx.beginPath();
      ctx.moveTo(0, r * 0.9);
      ctx.lineTo(-3, r * 1.35);
      ctx.lineTo(3, r * 1.35);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = this.eye;
      ctx.beginPath();
      ctx.arc(-3, -r * 0.55, 2.6, 0, Math.PI * 2);
      ctx.arc(3, -r * 0.55, 2.6, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (this.kind === 'tank') {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 2, r * 1.05, r * 0.95, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2a2218';
      ctx.beginPath();
      ctx.moveTo(-r * 0.55, -r * 0.2);
      ctx.lineTo(-r * 0.95, -r * 0.85);
      ctx.lineTo(-r * 0.25, -r * 0.45);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r * 0.55, -r * 0.2);
      ctx.lineTo(r * 0.95, -r * 0.85);
      ctx.lineTo(r * 0.25, -r * 0.45);
      ctx.fill();
      ctx.fillStyle = this.eye;
      ctx.beginPath();
      ctx.arc(-6, -r * 0.2, 3.2, 0, Math.PI * 2);
      ctx.arc(6, -r * 0.2, 3.2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (this.kind === 'spitter') {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 4, r * 0.7, r * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6a2a88';
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.45, r * 0.62, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a0818';
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.35, r * 0.32, r * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = this.eye;
      ctx.beginPath();
      ctx.arc(-6, -r * 0.62, 2.4, 0, Math.PI * 2);
      ctx.arc(6, -r * 0.62, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7dff9a';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(0, -r * 0.2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      return;
    }

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 2, r * 0.85, r * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a332c';
    ctx.beginPath();
    ctx.ellipse(-r * 0.55, -r * 0.15, r * 0.28, r * 0.7, 0.4 + kick, 0, Math.PI * 2);
    ctx.ellipse(r * 0.55, -r * 0.15, r * 0.28, r * 0.7, -0.4 - kick, 0, Math.PI * 2);
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
    const boss = this.kind === 'boss';
    const w = Math.max(22, this.radius * (boss ? 2.4 : 2));
    const h = boss ? 5 : 3;
    const x = this.x - w / 2;
    const y = this.y - this.radius - (boss ? 18 : 12);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = boss ? '#ffe14a' : '#ff4d4d';
    ctx.fillRect(x, y, w * (this.hp / this.maxHp), h);
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
