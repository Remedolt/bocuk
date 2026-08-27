interface Particle {
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
  x: number;
  y: number;
  life: number;
  text: string;
  color: string;
}

export class Particles {
  private list: Particle[] = [];
  private floaters: Floater[] = [];

  burst(x: number, y: number, color: string, n = 8, speed = 140): void {
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.4 + Math.random() * 0.8);
      this.list.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.28 + Math.random() * 0.25,
        max: 0.5,
        size: 2 + Math.random() * 3,
        color,
      });
    }
  }

  float(x: number, y: number, text: string, color = '#f0c14b'): void {
    this.floaters.push({ x, y, life: 0.7, text, color });
  }

  update(dt: number): void {
    for (const p of this.list) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= dt;
    }
    this.list = this.list.filter((p) => p.life > 0);
    for (const f of this.floaters) {
      f.y -= 38 * dt;
      f.life -= dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.list) {
      ctx.globalAlpha = p.life / p.max;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.font = '700 13px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  clear(): void {
    this.list.length = 0;
    this.floaters.length = 0;
  }
}
