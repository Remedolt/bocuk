import { ARENA, CRYSTAL } from './constants';
import { rand } from './math';
import type { Camera } from './Camera';
import type { Player } from './Player';

let nextId = 1_000_000;

export class Crystal {
  id = 0;
  alive = false;
  x = 0;
  y = 0;
  hp = CRYSTAL.hp;
  maxHp = CRYSTAL.hp;
  radius = CRYSTAL.radius;
  spin = 0;
  hitFlash = 0;

  spawn(x: number, y: number): void {
    this.id = nextId++;
    this.alive = true;
    this.x = x;
    this.y = y;
    this.maxHp = CRYSTAL.hp;
    this.hp = this.maxHp;
    this.radius = CRYSTAL.radius;
    this.spin = Math.random() * Math.PI * 2;
    this.hitFlash = 0;
  }

  update(dt: number): void {
    if (!this.alive) return;
    this.spin += dt * 1.4;
    this.hitFlash = Math.max(0, this.hitFlash - dt);
  }

  hurt(amount: number): boolean {
    if (!this.alive) return false;
    this.hp -= amount;
    this.hitFlash = 0.1;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      return true;
    }
    return false;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;
    const flash = this.hitFlash > 0;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.spin);
    ctx.shadowColor = '#7dffc8';
    ctx.shadowBlur = flash ? 22 : 14;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(2, 12, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = flash ? '#f4fff8' : '#2dffb4';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(11, -2);
    ctx.lineTo(7, 14);
    ctx.lineTo(-7, 14);
    ctx.lineTo(-11, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0b3a28';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#e8fff4';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(5, -2);
    ctx.lineTo(0, 4);
    ctx.lineTo(-3, -2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (this.hp < this.maxHp) {
      const w = 28;
      const x = this.x - w / 2;
      const y = this.y - 22;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(x, y, w, 3);
      ctx.fillStyle = '#7dffc8';
      ctx.fillRect(x, y, w * (this.hp / this.maxHp), 3);
    }
  }
}

export class CrystalPool {
  readonly items: Crystal[] = [];
  private acc = 0;

  living(): Crystal[] {
    return this.items.filter((c) => c.alive);
  }

  count(): number {
    let n = 0;
    for (const c of this.items) if (c.alive) n += 1;
    return n;
  }

  maybeSpawn(dt: number, player: Player, camera: Camera): void {
    if (this.count() >= CRYSTAL.maxAlive) return;
    this.acc += dt;
    if (this.acc < 1) return;
    this.acc = 0;
    if (Math.random() > CRYSTAL.chancePerSec) return;
    const dist = Math.min(Math.max(camera.visibleRadius() * 0.55, 160), 320);
    const a = rand(0, Math.PI * 2);
    const x = player.x + Math.cos(a) * dist;
    const y = player.y + Math.sin(a) * dist;
    const limit = ARENA.size / 2 - 60;
    this.spawn(
      Math.max(-limit, Math.min(limit, x)),
      Math.max(-limit, Math.min(limit, y)),
    );
  }

  spawn(x: number, y: number): Crystal {
    let c = this.items.find((item) => !item.alive);
    if (!c) {
      c = new Crystal();
      this.items.push(c);
    }
    c.spawn(x, y);
    return c;
  }

  update(dt: number): void {
    for (const c of this.items) c.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const c of this.items) c.draw(ctx);
  }

  clear(): void {
    for (const c of this.items) c.alive = false;
    this.acc = 0;
  }
}
