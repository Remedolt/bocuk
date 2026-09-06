import { SPRITE_UP, drawSprite } from './draw';
import { distSq } from './math';
import type { Assets } from './Assets';
import type { Player } from './Player';

export class DropItem {
  alive = false;
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  value = 1;
  radius = 7;
  bob = 0;

  spawn(x: number, y: number, value: number): void {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 80;
    this.vy = (Math.random() - 0.5) * 80;
    this.value = value;
    this.bob = Math.random() * Math.PI * 2;
  }

  update(dt: number, player: Player): boolean {
    if (!this.alive) return false;
    this.bob += dt * 6;
    this.vx *= 0.9;
    this.vy *= 0.9;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const d2 = dx * dx + dy * dy;
    const magnet = player.magnetRange;
    if (d2 < magnet * magnet && d2 > 1) {
      const d = Math.sqrt(d2);
      const pull = 520 * (1 - d / magnet);
      this.vx += (dx / d) * pull * dt;
      this.vy += (dy / d) * pull * dt;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (distSq(this.x, this.y, player.x, player.y) < player.pickupRange * player.pickupRange) {
      this.alive = false;
      player.materials += this.value;
      player.xp += this.value;
      return true;
    }
    return false;
  }

  draw(ctx: CanvasRenderingContext2D, assets: Assets): void {
    if (!this.alive) return;
    const y = this.y + Math.sin(this.bob) * 3;
    drawSprite(ctx, assets.get('xp'), this.x, y, 16, 16, SPRITE_UP, () => {
      ctx.fillStyle = '#0b6b32';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4dff88';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.arc(-2, -2.4, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

export class DropPool {
  readonly items: DropItem[] = [];

  spawn(x: number, y: number, value: number): void {
    let d = this.items.find((item) => !item.alive);
    if (!d) {
      d = new DropItem();
      this.items.push(d);
    }
    d.spawn(x, y, value);
  }

  update(dt: number, player: Player): number {
    let grabbed = 0;
    for (const item of this.items) {
      if (item.update(dt, player)) grabbed += 1;
    }
    return grabbed;
  }

  count(): number {
    let n = 0;
    for (const item of this.items) if (item.alive) n += 1;
    return n;
  }

  collectAll(player: Player): number {
    let grabbed = 0;
    for (const item of this.items) {
      if (!item.alive) continue;
      player.materials += item.value;
      player.xp += item.value;
      item.alive = false;
      grabbed += 1;
    }
    return grabbed;
  }

  draw(ctx: CanvasRenderingContext2D, assets: Assets): void {
    for (const item of this.items) item.draw(ctx, assets);
  }

  clear(): void {
    for (const item of this.items) item.alive = false;
  }
}
