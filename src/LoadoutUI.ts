import { WEAPON_BLURB, WEAPON_DEFS, WEAPON_IDS } from './constants';
import { Weapon } from './Weapon';
import type { WeaponId } from './types';

export class LoadoutUI {
  private root: HTMLElement;
  private grid: HTMLElement;
  onPick: ((id: WeaponId) => void) | null = null;
  onBack: (() => void) | null = null;

  constructor() {
    this.root = document.getElementById('overlay-loadout')!;
    this.grid = document.getElementById('loadout-grid')!;
    document.getElementById('btn-loadout-back')!.addEventListener('click', () => this.onBack?.());
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
    for (const id of WEAPON_IDS) {
      const def = WEAPON_DEFS[id];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'arm-card';
      card.style.setProperty('--tint', def.glow);
      card.innerHTML = `
        <canvas class="arm-art" width="160" height="100"></canvas>
        <span class="arm-name">${def.name}</span>
        <span class="arm-blurb">${WEAPON_BLURB[id]}</span>
      `;
      card.addEventListener('click', () => this.onPick?.(id));
      this.grid.append(card);
    }
  }

  private paint(): void {
    const cards = this.grid.querySelectorAll<HTMLButtonElement>('.arm-card');
    WEAPON_IDS.forEach((id, i) => {
      const canvas = cards[i]?.querySelector('canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const cssW = canvas.clientWidth || 160;
      const cssH = canvas.clientHeight || 100;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      const gun = new Weapon(WEAPON_DEFS[id]);
      gun.drawPreview(ctx, cssW / 2, cssH / 2, cssW < 140 ? 1.26 : 1.54);
    });
  }
}
