import { CRYSTAL, HERO_DEFS, MAX_WEAPON_RANK, MAX_WEAPON_SLOTS, PLAYER, STARTER_WEAPON, WEAPON_DEFS } from './constants';
import { distSq } from './math';
import { Arena } from './Arena';
import { Assets } from './Assets';
import { Camera } from './Camera';
import { Crystal, CrystalPool } from './Crystal';
import { DropPool } from './DropItem';
import { EnemyPool } from './Enemy';
import { HeroUI } from './HeroUI';
import { Hud } from './Hud';
import { Input } from './Input';
import { LoadoutUI } from './LoadoutUI';
import { Particles } from './Particles';
import { Player } from './Player';
import { ProjectilePool } from './Projectile';
import { ShopUI } from './ShopUI';
import { Sound } from './Sound';
import { Spawner } from './Spawner';
import { Weapon } from './Weapon';
import type { GameState, HeroId, WeaponId } from './types';

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
  private crystals = new CrystalPool();
  private spawner = new Spawner();
  private particles = new Particles();
  private hud = new Hud();
  private shop = new ShopUI();
  private heroes = new HeroUI();
  private loadout = new LoadoutUI();
  private orbit = 0;
  private shopDelay = 0;
  private savedMagnet = PLAYER.magnetRange;
  private savedPickup = PLAYER.pickupRange;
  private pickedHero: HeroId = 'kurtcuk';

  async init(): Promise<void> {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const ctx = this.canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D desteklenmiyor');
    this.ctx = ctx;
    await this.assets.loadAll();
    this.shop.onContinue = () => this.nextWave();
    this.heroes.onPick = (id) => {
      this.pickedHero = id;
      this.openLoadout();
    };
    this.heroes.onBack = () => this.quitToMenu();
    this.loadout.onPick = (id) => this.start(id);
    this.loadout.onBack = () => this.openHero();
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
      this.openHero();
    });
    document.getElementById('btn-restart')!.addEventListener('click', () => {
      void this.ensureFullscreen();
      this.openHero();
    });
    document.getElementById('btn-pause-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('btn-resume')?.addEventListener('click', () => this.resume());
    document.getElementById('btn-quit')?.addEventListener('click', () => this.quitToMenu());

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' && this.state === 'gameover') this.openHero();
      if (e.code === 'Escape') {
        if (this.state === 'loadout') this.openHero();
        else if (this.state === 'hero') this.quitToMenu();
        else if (this.state === 'paused') this.resume();
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

  private inRun(): boolean {
    return this.state !== 'menu' && this.state !== 'hero' && this.state !== 'loadout';
  }

  private hideMenus(): void {
    this.shop.hide();
    this.heroes.hide();
    this.loadout.hide();
    this.hud.showStart(false);
    this.hud.showGameOver(false);
    this.hud.showPause(false);
  }

  private openHero(): void {
    this.sound.resume();
    void this.ensureFullscreen();
    this.state = 'hero';
    this.hideMenus();
    this.hud.showHud(false);
    this.heroes.show();
  }

  private openLoadout(): void {
    this.sound.resume();
    void this.ensureFullscreen();
    this.state = 'loadout';
    this.hideMenus();
    this.hud.showHud(false);
    this.loadout.show();
  }

  private start(weaponId: WeaponId = STARTER_WEAPON): void {
    this.sound.resume();
    this.sound.wave();
    void this.ensureFullscreen();
    this.player.reset(HERO_DEFS[this.pickedHero]);
    this.savedMagnet = this.player.magnetRange;
    this.savedPickup = this.player.pickupRange;
    this.weapons = [new Weapon(WEAPON_DEFS[weaponId])];
    this.projectiles.clear();
    this.enemies.clear();
    this.drops.clear();
    this.crystals.clear();
    this.particles.clear();
    this.orbit = 0;
    this.shopDelay = 0;
    this.hideMenus();
    this.hud.showHud(true);
    this.arena.setWave(1);
    this.spawner.startWave(1);
    this.state = 'playing';
    this.hud.showBanner('DALGA 1', this.spawner.introLine());
  }

  private nextWave(): void {
    this.player.magnetRange = this.savedMagnet;
    this.player.pickupRange = this.savedPickup;
    this.enemies.clear();
    this.projectiles.clear();
    this.crystals.clear();
    this.shopDelay = 0;
    this.spawner.startWave(this.spawner.wave + 1);
    this.arena.setWave(this.spawner.wave);
    this.state = 'playing';
    this.sound.wave();
    const title = this.spawner.isBossWave() ? 'PATRON' : `DALGA ${this.spawner.wave}`;
    this.hud.showBanner(title, this.spawner.introLine(), this.spawner.isBossWave() ? 2.4 : 1.8);
  }

  private pause(): void {
    if (this.state !== 'playing' && this.state !== 'clearing') return;
    this.state = 'paused';
    this.hud.showPause(true);
  }

  private resume(): void {
    if (this.state !== 'paused') return;
    this.hud.showPause(false);
    if (this.spawner.spawning) {
      this.state = 'playing';
    } else if (this.enemies.count() > 0) {
      this.finishWave();
    } else {
      this.state = 'clearing';
    }
  }

  private quitToMenu(): void {
    this.state = 'menu';
    this.hideMenus();
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

  private mergeWeapon = (id: WeaponId): boolean => {
    const copies = this.weapons.filter((w) => w.def.id === id).sort((a, b) => b.rank - a.rank);
    if (copies.length < 2) return false;
    const keep = copies[0]!;
    const extra = copies[1]!;
    if (keep.rank >= MAX_WEAPON_RANK) return false;
    keep.rank += 1;
    this.weapons.splice(this.weapons.indexOf(extra), 1);
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
    this.vacuumMats();
    this.state = 'shop';
    this.sound.shop();
    this.hud.showBanner('TEÇHİZAT', 'DALGA BİTTİ', 1.1);
    this.shop.show(this.player, this.weapons, this.spawner.wave, this.addWeapon, this.mergeWeapon);
  }

  private vacuumMats(): void {
    const grabbed = this.drops.collectAll(this.player);
    if (grabbed > 0) this.sound.pickup();
  }

  private simulate(dt: number): void {
    const running = this.state === 'playing' || this.state === 'clearing';
    if (!running || !this.player.alive) return;

    this.player.update(dt, this.input, this.arena.half);
    this.orbit += PLAYER.orbitSpeed * dt;

    this.spawner.update(dt, this.enemies, this.player, this.camera);
    if (this.state === 'playing') this.crystals.maybeSpawn(dt, this.player, this.camera);
    this.crystals.update(dt);

    const living = this.enemies.living();
    const hunts = [...living, ...this.crystals.living()];
    for (const enemy of this.enemies.items) enemy.update(dt, this.player);

    this.separateEnemies(living);

    for (let i = 0; i < this.weapons.length; i += 1) {
      const weapon = this.weapons[i]!;
      weapon.update(dt, this.player.x, this.player.y, this.orbit, i, this.weapons.length);
      const target = weapon.nearest(hunts);
      if (target) {
        weapon.aim = Math.atan2(target.y - weapon.y, target.x - weapon.x);
        if (weapon.tryFire(this.projectiles, target, this.player.damageMul)) {
          this.sound.shoot(640 + i * 80);
        }
      }
    }

    this.projectiles.update(dt);
    this.collideProjectiles(living);
    this.collideCrystals();
    this.collidePlayer(living);

    const grabbed = this.drops.update(dt, this.player);
    if (grabbed > 0) this.sound.pickup();

    this.particles.update(dt);

    if (this.state === 'playing' && !this.spawner.spawning) {
      this.finishWave();
    }

    if (this.state === 'clearing') {
      if (this.shopDelay === 0) {
        this.savedMagnet = this.player.magnetRange;
        this.savedPickup = this.player.pickupRange;
      }
      this.player.magnetRange = 1400;
      this.player.pickupRange = 120;
      this.shopDelay += dt;
      if (this.shopDelay > 0.85 || this.drops.count() === 0) this.openShop();
    }

    if (!this.player.alive) this.gameOver();
  }

  private finishWave(): void {
    for (const crystal of this.crystals.items) {
      if (crystal.alive) this.popCrystal(crystal);
    }
    for (const enemy of this.enemies.items) {
      if (!enemy.alive) continue;
      this.drops.spawn(enemy.x, enemy.y, enemy.xp);
      this.particles.burst(enemy.x, enemy.y, enemy.color, 10, 140);
      enemy.alive = false;
    }
    this.projectiles.clear();
    this.player.magnetPulse = Math.max(this.player.magnetPulse, 1.1);
    this.state = 'clearing';
    this.hud.showBanner('DALGA BİTTİ', 'MAT TOPLANIYOR', 1.2);
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

  private collideCrystals(): void {
    for (const shot of this.projectiles.items) {
      if (!shot.alive) continue;
      for (const crystal of this.crystals.items) {
        if (!crystal.alive || shot.hitIds.has(crystal.id)) continue;
        const r = shot.radius + crystal.radius;
        if (distSq(shot.x, shot.y, crystal.x, crystal.y) > r * r) continue;
        shot.hitIds.add(crystal.id);
        const popped = crystal.hurt(shot.damage);
        this.particles.burst(shot.x, shot.y, '#7dffc8', 6, 100);
        this.sound.hit();
        if (popped) this.popCrystal(crystal);
        shot.pierce -= 1;
        if (shot.pierce < 0) {
          shot.alive = false;
          break;
        }
      }
    }
  }

  private popCrystal(crystal: Crystal): void {
    crystal.alive = false;
    const payout = CRYSTAL.shards * CRYSTAL.shardValue;
    for (let i = 0; i < CRYSTAL.shards; i += 1) {
      const a = (i / CRYSTAL.shards) * Math.PI * 2;
      this.drops.spawn(
        crystal.x + Math.cos(a) * 18,
        crystal.y + Math.sin(a) * 18,
        CRYSTAL.shardValue,
      );
    }
    this.particles.burst(crystal.x, crystal.y, '#2dffb4', 22, 220);
    this.particles.float(crystal.x, crystal.y - 16, `+${payout}`, '#7dffc8');
    this.player.magnetPulse = Math.max(this.player.magnetPulse, 0.55);
    this.camera.bump(8);
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
    ctx.fillStyle = this.arena.theme.clear;
    ctx.fillRect(0, 0, this.viewW, this.viewH);

    ctx.save();
    this.camera.apply(ctx);
    this.arena.draw(ctx, this.camera, this.assets);
    this.drops.draw(ctx, this.assets);
    this.crystals.draw(ctx);
    for (const enemy of this.enemies.items) enemy.draw(ctx, this.assets);
    this.projectiles.draw(ctx, this.assets);
    if (this.inRun()) this.player.draw(ctx, this.assets);
    if (this.inRun()) {
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

    if (this.state !== 'paused' && this.state !== 'shop' && this.inRun()) {
      this.simulate(dt);
    }
    if (this.state === 'shop') this.particles.update(dt);

    this.camera.follow(this.player.x, this.player.y, dt);
    this.render();

    if (this.inRun() || this.state === 'shop' || this.state === 'paused') {
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
