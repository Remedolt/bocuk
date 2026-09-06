interface Particle {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
}

interface Floater {
  alive: boolean;
  x: number;
  y: number;
  life: number;
  text: string;
  color: string;
}

const MAX_PARTICLES = 180;
const MAX_FLOATERS = 24;

export class Particles {
  private list: Particle[] = [];
  private floaters: Floater[] = [];

  burst(x: number, y: number, color: string, n = 8, speed = 140): void {
    const count = Math.min(n, 16);
    for (let i = 0; i < count; i += 1) {
      const p = this.allocParticle();
      if (!p) break;
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.4 + Math.random() * 0.8);
      p.alive = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * s;
      p.vy = Math.sin(a) * s;
      p.life = 0.28 + Math.random() * 0.25;
      p.max = 0.5;
      p.size = 2 + Math.random() * 3;
      p.color = color;
    }
  }

  float(x: number, y: number, text: string, color = '#f0c14b'): void {
    const f = this.allocFloater();
    if (!f) return;
    f.alive = true;
    f.x = x;
    f.y = y;
    f.life = 0.7;
    f.text = text;
    f.color = color;
  }

  private allocParticle(): Particle | null {
    for (const p of this.list) {
      if (!p.alive) return p;
    }
    if (this.list.length >= MAX_PARTICLES) return null;
    const p: Particle = {
      alive: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      max: 0.5,
      size: 2,
      color: '#fff',
    };
    this.list.push(p);
    return p;
  }

  private allocFloater(): Floater | null {
    for (const f of this.floaters) {
      if (!f.alive) return f;
    }
    if (this.floaters.length >= MAX_FLOATERS) return null;
    const f: Floater = { alive: false, x: 0, y: 0, life: 0, text: '', color: '#fff' };
    this.floaters.push(f);
    return f;
  }

  update(dt: number): void {
    for (const p of this.list) {
      if (!p.alive) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= dt;
      if (p.life <= 0) p.alive = false;
    }
    for (const f of this.floaters) {
      if (!f.alive) continue;
      f.y -= 38 * dt;
      f.life -= dt;
      if (f.life <= 0) f.alive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.list) {
      if (!p.alive) continue;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.font = '700 13px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    for (const f of this.floaters) {
      if (!f.alive) continue;
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  clear(): void {
    for (const p of this.list) p.alive = false;
    for (const f of this.floaters) f.alive = false;
  }
}
