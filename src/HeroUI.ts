import { HERO_DEFS, HERO_IDS, PLAYER } from './constants';
import { paintHero } from './Player';
import type { HeroId } from './types';

export class HeroUI {
  private root: HTMLElement;
  private grid: HTMLElement;
  onPick: ((id: HeroId) => void) | null = null;
  onBack: (() => void) | null = null;

  constructor() {
    this.root = document.getElementById('overlay-hero')!;
    this.grid = document.getElementById('hero-grid')!;
    document.getElementById('btn-hero-back')!.addEventListener('click', () => this.onBack?.());
    window.addEventListener('resize', () => {
      if (!this.root.classList.contains('hidden')) this.paint();
    });
  }

  show(): void {
    this.build();
    this.root.classList.remove('hidden');
    requestAnimationFrame(() => this.paint());
  }

  hide(): void {
    this.root.classList.add('hidden');
  }

  private build(): void {
    this.grid.replaceChildren();
    for (const id of HERO_IDS) {
      const def = HERO_DEFS[id];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'arm-card hero-card';
      card.style.setProperty('--tint', def.accent);
      card.innerHTML = `
        <canvas class="arm-art hero-art" width="160" height="120"></canvas>
        <span class="arm-name">${def.name}</span>
        <span class="arm-blurb">${def.blurb}</span>
      `;
      card.addEventListener('click', () => this.onPick?.(id));
      this.grid.append(card);
    }
  }

  private paint(): void {
    const cards = this.grid.querySelectorAll<HTMLButtonElement>('.hero-card');
    HERO_IDS.forEach((id, i) => {
      const canvas = cards[i]?.querySelector('canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const cssW = canvas.clientWidth || 160;
      const cssH = canvas.clientHeight || 120;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.save();
      ctx.translate(cssW / 2, cssH / 2 + 8);
      paintHero(ctx, HERO_DEFS[id], PLAYER.radius * 1.35);
      ctx.restore();
    });
  }
}
