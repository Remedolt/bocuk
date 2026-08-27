import { MAX_WEAPON_SLOTS, PLAYER, STARTER_WEAPON, WEAPON_DEFS } from './constants';
import { distSq } from './math';
import { Arena } from './Arena';
import { Assets } from './Assets';
import { Camera } from './Camera';
import { DropPool } from './DropItem';
import { EnemyPool } from './Enemy';
import { Hud } from './Hud';
import { Input } from './Input';
import { Particles } from './Particles';
import { Player } from './Player';
import { ProjectilePool } from './Projectile';
import { ShopUI } from './ShopUI';
import { Sound } from './Sound';
import { Spawner } from './Spawner';
import { Weapon } from './Weapon';
import type { GameState, WeaponId } from './types';

export class Game {
  state: GameState = 'menu';
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private viewW = 1;
  private viewH = 1;
  private dpr = 1;
  private last = 0;

  private assets = new Assets();
  private input = new Input();
  private sound = new Sound();
  private camera = new Camera();
  private arena = new Arena();
  private player = new Player();
  private weapons: Weapon[] = [];
  private projectiles = new ProjectilePool();
  private enemies = new EnemyPool();
  private drops = new DropPool();
  private spawner = new Spawner();
  private particles = new Particles();
  private hud = new Hud();
  private shop = new ShopUI();
  private orbit = 0;
  private shopDelay = 0;
  private savedMagnet = PLAYER.magnetRange;
  private savedPickup = PLAYER.pickupRange;

  async init(): Promise<void> {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const ctx = this.canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D desteklenmiyor');
    this.ctx = ctx;
    await this.assets.loadAll();
    this.shop.onContinue = () => this.nextWave();
    this.bind();
    this.resize();
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  }

  private bind(): void {
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('fullscreenchange', () => this.resize());
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    document.getElementById('btn-start')!.addEventListener('click', () => {
      void this.ensureFullscreen();
      this.start();
    });
    document.getElementById('btn-restart')!.addEventListener('click', () => {
      void this.ensureFullscreen();
      this.start();
    });
    document.getElementById('btn-pause-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('btn-resume')?.addEventListener('click', () => this.resume());
    document.getElementById('btn-quit')?.addEventListener('click', () => this.quitToMenu());

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' && this.state === 'gameover') this.start();
      if (e.code === 'Escape') {
        if (this.state === 'paused') this.resume();
        else if (this.state === 'playing' || this.state === 'clearing') this.pause();
      }
    });
  }

  private resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.viewW = window.innerWidth;
    this.viewH = window.innerHeight;
    this.canvas.width = Math.floor(this.viewW * this.dpr);
    this.canvas.height = Math.floor(this.viewH * this.dpr);
    this.canvas.style.width = `${this.viewW}px`;
    this.canvas.style.height = `${this.viewH}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.camera.resize(this.viewW, this.viewH);
  }

  private start(): void {
    this.sound.resume();
    this.sound.wave();
    void this.ensureFullscreen();
    this.player.reset();
    this.savedMagnet = this.player.magnetRange;
    this.savedPickup = this.player.pickupRange;
    this.weapons = [new Weapon(WEAPON_DEFS[STARTER_WEAPON])];
    this.projectiles.clear();
    this.enemies.clear();
    this.drops.clear();
    this.particles.clear();
    this.orbit = 0;
    this.shopDelay = 0;
    this.shop.hide();
    this.hud.showStart(false);
    this.hud.showGameOver(false);
    this.hud.showPause(false);
    this.hud.showHud(true);
    this.spawner.startWave(1);
    this.state = 'playing';
    this.hud.showBanner('DALGA 1', 'HAYATTA KAL');
  }

  private nextWave(): void {
    this.player.magnetRange = this.savedMagnet;
    this.player.pickupRange = this.savedPickup;
    this.enemies.clear();
    this.projectiles.clear();
    this.shopDelay = 0;
    this.spawner.startWave(this.spawner.wave + 1);
    this.state = 'playing';
    this.sound.wave();
    this.hud.showBanner(`DALGA ${this.spawner.wave}`, 'DAHA SERT GELİYORLAR');
  }

  private pause(): void {
    if (this.state !== 'playing' && this.state !== 'clearing') return;
    this.state = 'paused';
    this.hud.showPause(true);
  }

  private resume(): void {
    if (this.state !== 'paused') return;
    this.state = this.spawner.spawning ? 'playing' : 'clearing';
    this.hud.showPause(false);
  }

  private quitToMenu(): void {
    this.state = 'menu';
    this.shop.hide();
    this.hud.showPause(false);
    this.hud.showGameOver(false);
    this.hud.showHud(false);
    this.hud.showStart(true);
  }

  private async ensureFullscreen(): Promise<void> {
    if (document.fullscreenElement) return;
    const root = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    try {
      const req = root.requestFullscreen
        ? root.requestFullscreen({ navigationUI: 'hide' })
        : Promise.resolve(root.webkitRequestFullscreen?.());
      void Promise.resolve(req).catch(() => {
        void this.canvas.requestFullscreen?.().catch(() => {});
      });
    } catch {
      /* jest yoksa pencere modunda devam */
    }
  }

  private toggleFullscreen(forceOn = false): void {
    const root = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => void;
      webkitExitFullscreen?: () => void;
    };
    if (!document.fullscreenElement) {
      void this.ensureFullscreen();
    } else if (!forceOn) {
      void document.exitFullscreen?.().catch(() => {});
      root.webkitExitFullscreen?.();
    }
  }

  private addWeapon = (id: WeaponId): boolean => {
    if (this.weapons.length >= MAX_WEAPON_SLOTS) return false;
    this.weapons.push(new Weapon(WEAPON_DEFS[id]));
    this.sound.shop();
    return true;
  };

  private gameOver(): void {
    this.state = 'gameover';
    this.sound.death();
    this.hud.showGameOver(true, {
      wave: this.spawner.wave,
      xp: this.player.xp,
      kills: this.player.kills,
    });
  }

  private openShop(): void {
    this.state = 'shop';
    this.sound.shop();
    this.hud.showBanner('TEÇHİZAT', 'DALGA BİTTİ', 1.1);
    this.shop.show(this.player, this.weapons, this.spawner.wave, this.addWeapon);
  }

  private simulate(dt: number): void {
    const running = this.state === 'playing' || this.state === 'clearing';
    if (!running || !this.player.alive) return;

    this.player.update(dt, this.input, this.arena.half);
    this.orbit += PLAYER.orbitSpeed * dt;

    this.spawner.update(dt, this.enemies, this.player, this.camera);

    const living = this.enemies.living();
    for (const enemy of this.enemies.items) enemy.update(dt, this.player);

    this.separateEnemies(living);

    for (let i = 0; i < this.weapons.length; i += 1) {
      const weapon = this.weapons[i]!;
      weapon.update(dt, this.player.x, this.player.y, this.orbit, i, this.weapons.length);
      const target = weapon.nearest(living);
      if (target) {
        weapon.aim = Math.atan2(target.y - weapon.y, target.x - weapon.x);
        if (weapon.tryFire(this.projectiles, target, this.player.damageMul)) {
          this.sound.shoot(640 + i * 80);
        }
      }
    }

    this.projectiles.update(dt);
    this.collideProjectiles(living);
    this.collidePlayer(living);

    const grabbed = this.drops.update(dt, this.player);
    if (grabbed > 0) this.sound.pickup();

    this.particles.update(dt);

    if (this.state === 'playing' && !this.spawner.spawning) {
      this.state = 'clearing';
      this.hud.showBanner('SÜRE DOLDU', 'KALANLARI TEMİZLE', 1.6);
    }

    if (this.state === 'clearing' && this.enemies.count() === 0) {
      if (this.shopDelay === 0) {
        this.savedMagnet = this.player.magnetRange;
        this.savedPickup = this.player.pickupRange;
      }
      this.player.magnetRange = 1400;
      this.player.pickupRange = 120;
      this.shopDelay += dt;
      if (this.shopDelay > 0.7) this.openShop();
    }

    if (!this.player.alive) this.gameOver();
  }

  private separateEnemies(living: ReturnType<EnemyPool['living']>): void {
    for (let i = 0; i < living.length; i += 1) {
      const a = living[i]!;
      for (let j = i + 1; j < living.length; j += 1) {
        const b = living[j]!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const min = a.radius + b.radius;
        const d2 = dx * dx + dy * dy;
        if (d2 > min * min || d2 < 1e-4) continue;
        const d = Math.sqrt(d2);
        const push = ((min - d) / d) * 0.5;
        a.x -= dx * push;
        a.y -= dy * push;
        b.x += dx * push;
        b.y += dy * push;
      }
    }
  }

  private collideProjectiles(living: ReturnType<EnemyPool['living']>): void {
    for (const shot of this.projectiles.items) {
      if (!shot.alive) continue;
      for (const enemy of living) {
        if (!enemy.alive || shot.hitIds.has(enemy.id)) continue;
        const r = shot.radius + enemy.radius;
        if (distSq(shot.x, shot.y, enemy.x, enemy.y) > r * r) continue;
        shot.hitIds.add(enemy.id);
        const result = enemy.hurt(shot.damage);
        this.particles.burst(shot.x, shot.y, shot.glow, 5, 90);
        this.sound.hit();
        if (result.killed) {
          this.player.kills += 1;
          this.drops.spawn(enemy.x, enemy.y, result.xp);
          this.particles.burst(enemy.x, enemy.y, enemy.color, 14, 160);
          this.particles.float(enemy.x, enemy.y - 12, `+${result.xp}`, '#7dff9a');
        }
        shot.pierce -= 1;
        if (shot.pierce < 0) {
          shot.alive = false;
          break;
        }
      }
    }
  }

  private collidePlayer(living: ReturnType<EnemyPool['living']>): void {
    for (const enemy of living) {
      if (!enemy.alive) continue;
      const r = enemy.radius + this.player.radius;
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > r * r) continue;
      const d = Math.sqrt(d2) || 1;
      const push = (r - d) / d;
      this.player.x += dx * push * 0.35;
      this.player.y += dy * push * 0.35;
      enemy.x -= dx * push * 0.65;
      enemy.y -= dy * push * 0.65;
      if (enemy.attackCd <= 0) {
        enemy.attackCd = 0.7;
        const dead = this.player.takeDamage(enemy.damage);
        this.camera.bump(10);
        this.sound.hurt();
        if (dead) return;
      }
    }
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#12160f';
    ctx.fillRect(0, 0, this.viewW, this.viewH);

    ctx.save();
    this.camera.apply(ctx);
    this.arena.draw(ctx, this.camera, this.assets);
    this.drops.draw(ctx, this.assets);
    for (const enemy of this.enemies.items) enemy.draw(ctx, this.assets);
    this.projectiles.draw(ctx, this.assets);
    if (this.state !== 'menu') this.player.draw(ctx, this.assets);
    if (this.state !== 'menu') {
      for (const weapon of this.weapons) weapon.draw(ctx);
    }
    this.particles.draw(ctx);
    ctx.restore();

    ctx.fillStyle = 'rgba(10, 0, 0, 0.18)';
    ctx.fillRect(0, 0, this.viewW, this.viewH);
    const vg = ctx.createRadialGradient(
      this.viewW / 2,
      this.viewH / 2,
      Math.min(this.viewW, this.viewH) * 0.28,
      this.viewW / 2,
      this.viewH / 2,
      Math.hypot(this.viewW, this.viewH) * 0.55,
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(8, 4, 2, 0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.viewW, this.viewH);
  }

  private frame(now: number): void {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;

    if (this.state !== 'paused' && this.state !== 'shop' && this.state !== 'menu') {
      this.simulate(dt);
    }
    if (this.state === 'shop') this.particles.update(dt);

    this.camera.follow(this.player.x, this.player.y, dt);
    this.render();

    if (this.state !== 'menu') {
      this.hud.update(
        dt,
        this.player,
        this.spawner,
        this.weapons,
        this.state === 'clearing' || this.state === 'shop',
      );
    }

    requestAnimationFrame((t) => this.frame(t));
  }
}
