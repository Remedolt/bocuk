import { PLAYER } from './constants';
import { drawShadow, drawSprite } from './draw';
import { clamp } from './math';
import type { Assets } from './Assets';
import type { Input } from './Input';

export class Player {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  angle = -Math.PI / 2;
  radius = PLAYER.radius;
  maxHp = PLAYER.maxHp;
  hp = PLAYER.maxHp;
  speed = PLAYER.speed;
  armor = PLAYER.armor;
  damageMul = PLAYER.damageMul;
  pickupRange = PLAYER.pickupRange;
  magnetRange = PLAYER.magnetRange;
  invuln = 0;
  hurtFlash = 0;
  alive = true;
  kills = 0;
  materials = 0;
  xp = 0;

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.angle = -Math.PI / 2;
    this.maxHp = PLAYER.maxHp;
    this.hp = PLAYER.maxHp;
    this.speed = PLAYER.speed;
    this.armor = PLAYER.armor;
    this.damageMul = PLAYER.damageMul;
    this.pickupRange = PLAYER.pickupRange;
    this.magnetRange = PLAYER.magnetRange;
    this.invuln = 0;
    this.hurtFlash = 0;
    this.alive = true;
    this.kills = 0;
    this.materials = 0;
    this.xp = 0;
  }

  update(dt: number, input: Input, half: number): void {
    if (!this.alive) return;
    const axis = input.axis();
    this.vx = axis.x * this.speed;
    this.vy = axis.y * this.speed;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    const limit = half - this.radius - 8;
    this.x = clamp(this.x, -limit, limit);
    this.y = clamp(this.y, -limit, limit);
    if (axis.x || axis.y) this.angle = Math.atan2(this.vy, this.vx);
    this.invuln = Math.max(0, this.invuln - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
  }

  takeDamage(raw: number): boolean {
    if (!this.alive || this.invuln > 0) return false;
    const reduced = raw * (100 / (100 + this.armor));
    this.hp -= reduced;
    this.invuln = PLAYER.invulnTime;
    this.hurtFlash = 0.22;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      return true;
    }
    return false;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  draw(ctx: CanvasRenderingContext2D, assets: Assets): void {
    drawShadow(ctx, this.x, this.y, this.radius * 1.15, this.radius * 0.55);
    const blink = this.invuln > 0 && Math.floor(this.invuln * 18) % 2 === 0;
    if (blink) ctx.globalAlpha = 0.45;
    drawSprite(ctx, assets.get('player'), this.x, this.y, PLAYER.spriteSize, PLAYER.spriteSize, this.angle, () => {
      this.drawFallback(ctx);
    });
    ctx.globalAlpha = 1;
    this.drawHp(ctx);
  }

  private drawFallback(ctx: CanvasRenderingContext2D): void {
    const r = this.radius;
    ctx.fillStyle = '#1d2420';
    ctx.beginPath();
    ctx.ellipse(0, 10, r * 0.72, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.hurtFlash > 0 ? '#c44a3a' : '#3d4a3a';
    ctx.beginPath();
    ctx.ellipse(0, 2, r * 0.82, r * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5a6b52';
    ctx.beginPath();
    ctx.ellipse(0, -2, r * 0.7, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c8b090';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.55, r * 0.42, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a2218';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.62, r * 0.46, r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7dff9a';
    ctx.beginPath();
    ctx.arc(-r * 0.16, -r * 0.5, 2.2, 0, Math.PI * 2);
    ctx.arc(r * 0.16, -r * 0.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHp(ctx: CanvasRenderingContext2D): void {
    const w = 36;
    const h = 4;
    const x = this.x - w / 2;
    const y = this.y - this.radius - 16;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = this.hp / this.maxHp < 0.35 ? '#ff3b3b' : '#6dff6d';
    ctx.fillRect(x, y, w * (this.hp / this.maxHp), h);
  }
}
