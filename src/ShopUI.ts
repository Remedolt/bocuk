import { MAX_WEAPON_RANK, MAX_WEAPON_SLOTS, RANK_MARK, WEAPON_DEFS } from './constants';
import { pick } from './math';
import type { Player } from './Player';
import type { Weapon } from './Weapon';
import type { ShopOffer, WeaponId } from './types';

export class ShopUI {
  private root: HTMLElement;
  private offersEl: HTMLElement;
  private matEl: HTMLElement;
  private waveEl: HTMLElement;
  private statsEl: HTMLElement;
  private rerollBtn: HTMLButtonElement;
  private nextBtn: HTMLButtonElement;
  private rerollCostEl: HTMLElement;
  private slotsEl: HTMLElement;

  private player: Player | null = null;
  private weapons: Weapon[] = [];
  private wave = 1;
  private rerollCost = 8;
  private offers: ShopOffer[] = [];
  private addWeapon: ((id: WeaponId) => boolean) | null = null;
  private mergeWeapon: ((id: WeaponId) => boolean) | null = null;
  onContinue: (() => void) | null = null;

  constructor() {
    this.root = document.getElementById('shop')!;
    this.offersEl = document.getElementById('shop-offers')!;
    this.matEl = document.getElementById('shop-mat')!;
    this.waveEl = document.getElementById('shop-wave')!;
    this.statsEl = document.getElementById('shop-stats')!;
    this.rerollBtn = document.getElementById('shop-reroll') as HTMLButtonElement;
    this.nextBtn = document.getElementById('shop-next') as HTMLButtonElement;
    this.rerollCostEl = document.getElementById('reroll-cost')!;
    this.slotsEl = document.getElementById('shop-slots')!;

    this.rerollBtn.addEventListener('click', () => this.reroll());
    this.nextBtn.addEventListener('click', () => {
      this.hide();
      this.onContinue?.();
    });
  }

  get open(): boolean {
    return !this.root.classList.contains('hidden');
  }

  show(
    player: Player,
    weapons: Weapon[],
    wave: number,
    addWeapon: (id: WeaponId) => boolean,
    mergeWeapon: (id: WeaponId) => boolean,
  ): void {
    this.player = player;
    this.weapons = weapons;
    this.wave = wave;
    this.addWeapon = addWeapon;
    this.mergeWeapon = mergeWeapon;
    this.rerollCost = 6 + wave * 2;
    this.root.classList.remove('hidden');
    this.rollOffers();
    this.refresh();
  }

  hide(): void {
    this.root.classList.add('hidden');
  }

  private scale(base: number): number {
    return Math.round(base * (1 + (this.wave - 1) * 0.14));
  }

  private rollOffers(): void {
    const p = this.player!;
    const pool: ShopOffer[] = [
      {
        id: 'hp',
        title: '+20 Max HP',
        desc: 'Daha fazla can kapasitesi',
        cost: this.scale(14),
        tint: '#6dff6d',
        apply: () => {
          p.maxHp += 20;
          p.heal(20);
          return true;
        },
      },
      {
        id: 'spd',
        title: '+18 Hız',
        desc: 'WASD hareketi hızlanır',
        cost: this.scale(12),
        tint: '#7ec8ff',
        apply: () => {
          p.speed += 18;
          return true;
        },
      },
      {
        id: 'arm',
        title: '+8 Zırh',
        desc: 'Gelen hasarı azaltır',
        cost: this.scale(15),
        tint: '#c9b07a',
        apply: () => {
          p.armor += 8;
          return true;
        },
      },
      {
        id: 'dmg',
        title: '+15% Hasar',
        desc: 'Tüm silah hasarı çarpanı',
        cost: this.scale(16),
        tint: '#ff7a2a',
        apply: () => {
          p.damageMul += 0.15;
          return true;
        },
      },
      {
        id: 'mag',
        title: '+36 Mıknatıs',
        desc: 'Matları daha uzaktan çeker',
        cost: this.scale(10),
        tint: '#4dff88',
        apply: () => {
          p.pickupRange += 14;
          p.magnetRange += 36;
          return true;
        },
      },
      {
        id: 'heal',
        title: 'Tam İyileşme',
        desc: 'Canı tamamen doldur',
        cost: this.scale(8),
        tint: '#ff6b6b',
        apply: () => {
          p.hp = p.maxHp;
          return true;
        },
      },
    ];

    if (this.weapons.length < MAX_WEAPON_SLOTS) {
      const ids = Object.keys(WEAPON_DEFS) as WeaponId[];
      for (const id of ids) {
        const def = WEAPON_DEFS[id];
        pool.push({
          id: `w-${id}-${Math.random().toString(36).slice(2, 6)}`,
          title: def.name,
          desc: `Slot silahı · ${def.damage} hasar`,
          cost: this.scale(def.price || 18),
          tint: def.glow,
          apply: () => this.addWeapon?.(id) ?? false,
        });
      }
    }

    const merges = this.mergeOffers();
    const picked: ShopOffer[] = [...merges];
    const bag = [...pool];
    while (picked.length < 4 && bag.length) {
      const item = pick(bag);
      bag.splice(bag.indexOf(item), 1);
      picked.push(item);
    }
    this.offers = picked;
  }

  private mergeOffers(): ShopOffer[] {
    const seen = new Set<WeaponId>();
    const out: ShopOffer[] = [];
    for (const gun of this.weapons) {
      const id = gun.def.id;
      if (seen.has(id)) continue;
      seen.add(id);
      const copies = this.weapons.filter((w) => w.def.id === id).sort((a, b) => b.rank - a.rank);
      if (copies.length < 2) continue;
      const keep = copies[0]!;
      if (keep.rank >= MAX_WEAPON_RANK) continue;
      const next = keep.rank + 1;
      out.push({
        id: `merge-${id}`,
        title: `Birleştir ${keep.def.name} → ${RANK_MARK[next]}`,
        desc: 'Aynı iki silah tek yuvada güçlenir',
        cost: this.scale(10 + keep.rank * 4),
        tint: keep.def.glow,
        apply: () => this.mergeWeapon?.(id) ?? false,
      });
    }
    return out;
  }

  private reroll(): void {
    const p = this.player;
    if (!p || p.materials < this.rerollCost) return;
    p.materials -= this.rerollCost;
    this.rerollCost += 4;
    this.rollOffers();
    this.refresh();
  }

  private buy(offer: ShopOffer): void {
    const p = this.player;
    if (!p || p.materials < offer.cost) return;
    p.materials -= offer.cost;
    offer.apply();
    if (offer.id.startsWith('merge-')) this.rollOffers();
    else {
      this.offers = this.offers.filter((o) => o !== offer);
      if (this.offers.length === 0) this.rollOffers();
    }
    this.refresh();
  }

  private refresh(): void {
    const p = this.player!;
    this.matEl.textContent = String(p.materials);
    this.waveEl.textContent = String(this.wave);
    this.rerollCostEl.textContent = String(this.rerollCost);
    this.rerollBtn.disabled = p.materials < this.rerollCost;
    this.slotsEl.textContent = `${this.weapons.length}/${MAX_WEAPON_SLOTS}`;
    this.statsEl.innerHTML = `
      <span>HP ${Math.ceil(p.hp)}/${p.maxHp}</span>
      <span>Hız ${Math.round(p.speed)}</span>
      <span>Zırh ${p.armor}</span>
      <span>Hasar ×${p.damageMul.toFixed(2)}</span>
    `;
    this.offersEl.innerHTML = '';
    for (const offer of this.offers) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'offer-card';
      btn.style.setProperty('--tint', offer.tint);
      btn.disabled = p.materials < offer.cost;
      btn.innerHTML = `
        <span class="offer-title">${offer.title}</span>
        <span class="offer-desc">${offer.desc}</span>
        <span class="offer-cost">MAT ${offer.cost}</span>
      `;
      btn.addEventListener('click', () => this.buy(offer));
      this.offersEl.appendChild(btn);
    }
  }
}
