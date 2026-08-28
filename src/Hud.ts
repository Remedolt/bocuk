import type { Player } from './Player';
import type { Spawner } from './Spawner';
import type { Weapon } from './Weapon';

export class Hud {
  private hpFill: HTMLElement;
  private hpText: HTMLElement;
  private xpFill: HTMLElement;
  private mat: HTMLElement;
  private wave: HTMLElement;
  private timer: HTMLElement;
  private kills: HTMLElement;
  private slots: HTMLElement;
  private bannerEl: HTMLElement;
  private bannerTitle: HTMLElement;
  private bannerSub: HTMLElement;
  private hurt: HTMLElement;
  private bannerUntil = 0;

  constructor() {
    this.hpFill = document.getElementById('hp-fill')!;
    this.hpText = document.getElementById('hp-text')!;
    this.xpFill = document.getElementById('xp-fill')!;
    this.mat = document.getElementById('mat-value')!;
    this.wave = document.getElementById('wave-number')!;
    this.timer = document.getElementById('wave-timer')!;
    this.kills = document.getElementById('kill-value')!;
    this.slots = document.getElementById('slot-value')!;
    this.bannerEl = document.getElementById('wave-banner')!;
    this.bannerTitle = document.getElementById('banner-title')!;
    this.bannerSub = document.getElementById('banner-sub')!;
    this.hurt = document.getElementById('hurt')!;
  }

  showHud(on: boolean): void {
    document.getElementById('hud')!.classList.toggle('hidden', !on);
  }

  showStart(on: boolean): void {
    document.getElementById('overlay-start')!.classList.toggle('hidden', !on);
  }

  showPause(on: boolean): void {
    document.getElementById('overlay-pause')!.classList.toggle('hidden', !on);
  }

  showGameOver(on: boolean, stats?: { wave: number; xp: number; kills: number }): void {
    document.getElementById('overlay-gameover')!.classList.toggle('hidden', !on);
    if (stats) {
      document.getElementById('go-wave')!.textContent = String(stats.wave);
      document.getElementById('go-xp')!.textContent = String(stats.xp);
      document.getElementById('go-kills')!.textContent = String(stats.kills);
    }
  }

  showBanner(title: string, sub: string, duration = 1.8): void {
    this.bannerTitle.textContent = title;
    this.bannerSub.textContent = sub;
    this.bannerEl.classList.remove('hidden');
    this.bannerUntil = duration;
  }

  update(dt: number, player: Player, spawner: Spawner, weapons: Weapon[], clearing: boolean): void {
    const ratio = player.maxHp <= 0 ? 0 : player.hp / player.maxHp;
    this.hpFill.style.width = `${Math.max(0, ratio * 100)}%`;
    this.hpText.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
    document.getElementById('health-wrap')!.classList.toggle('low', ratio < 0.35);
    this.hurt.style.opacity = String(Math.min(0.72, player.hurtFlash * 3.2));

    const xpInto = player.xp % 40;
    this.xpFill.style.width = `${(xpInto / 40) * 100}%`;
    this.mat.textContent = String(player.materials);
    this.wave.textContent = String(spawner.wave);
    this.kills.textContent = String(player.kills);
    this.slots.textContent = `${weapons.length}/6`;

    if (clearing) {
      this.timer.textContent = 'BİTTİ';
      this.timer.classList.add('warn');
    } else {
      const t = Math.max(0, Math.ceil(spawner.timer));
      const m = Math.floor(t / 60);
      const s = String(t % 60).padStart(2, '0');
      this.timer.textContent = `${m}:${s}`;
      this.timer.classList.toggle('warn', t <= 10);
    }

    if (this.bannerUntil > 0) {
      this.bannerUntil -= dt;
      if (this.bannerUntil <= 0) this.bannerEl.classList.add('hidden');
    }
  }
}
