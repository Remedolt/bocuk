import { ARENA } from './constants';

export type BoltKind = 'spit' | 'fire' | 'acid';

export class EnemyBolt {
  alive = false;
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  damage = 8;
  radius = 6;
  life = 0;
  angle = 0;
  kind: BoltKind = 'spit';

  spawn(x: number, y: number, angle: number, kind: BoltKind, damage: number, speed: number): void {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.kind = kind;
    this.radius = kind === 'fire' ? 7 : kind === 'acid' ? 5.5 : 6.5;
    this.life = kind === 'fire' ? 1.35 : 1.55;
  }

  update(dt: number): void {
    if (!this.alive) return;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    const bound = ARENA.size / 2;
    if (this.life <= 0 || Math.abs(this.x) > bound || Math.abs(this.y) > bound) this.alive = false;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    if (this.kind === 'fire') {
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 9);
      g.addColorStop(0, '#fff4d0');
      g.addColorStop(0.35, '#ff7a2a');
      g.addColorStop(1, 'rgba(80, 10, 0, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe14a';
      ctx.beginPath();
      ctx.ellipse(-6, 0, 8, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.kind === 'acid') {
      ctx.fillStyle = '#c8ff3d';
      ctx.shadowColor = '#7dff3a';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5a8a10';
      ctx.beginPath();
      ctx.arc(2, 3, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#c46aff';
      ctx.shadowColor = '#8a4aaa';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8c8ff';
      ctx.beginPath();
      ctx.arc(-2, -1.5, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class EnemyBoltPool {
  readonly items: EnemyBolt[] = [];

  spawn(x: number, y: number, angle: number, kind: BoltKind, damage: number, speed: number): void {
    let b = this.items.find((item) => !item.alive);
    if (!b) {
      b = new EnemyBolt();
      this.items.push(b);
    }
    b.spawn(x, y, angle, kind, damage, speed);
  }

  update(dt: number): void {
    for (const b of this.items) b.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const b of this.items) b.draw(ctx);
  }

  clear(): void {
    for (const b of this.items) b.alive = false;
  }
}
