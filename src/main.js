import * as THREE from 'three';
import { Assets } from './Assets.js';
import { Player } from './Player.js';
import { Sound } from './Sound.js';
import { UI } from './UI.js';
import { WaveManager } from './WaveManager.js';
import { Weapon } from './Weapon.js';
import { World } from './World.js';

class Game {
  constructor() {
    this.state = 'menu';
    this.xp = 0;
    this.elapsed = 0;
    this.input = {};
    this._origin = new THREE.Vector3();
    this._dir = new THREE.Vector3();
    this.aimRay = new THREE.Raycaster();
    this.aimRay.far = 40;
  }

  async init() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.65;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.07,
      160,
    );

    this.clock = new THREE.Clock();
    this.sound = new Sound();
    this.ui = new UI();
    this.assets = new Assets();
    await this.assets.loadAll();

    this.world = new World(this.scene);
    this.player = new Player(this.camera, this.canvas, this.world, this.sound);
    this.scene.add(this.player.rig);
    this.player.reset();

    this.weapon = new Weapon(this.camera, this.scene, this.world, this.sound, this.assets);
    this.waves = new WaveManager(this.scene, this.world, this.sound, this.assets);
    this.waves.onBanner = (title, sub) => this.ui.showBanner(title, sub);

    this._bind();
    this.clock.start();
    this.renderer.setAnimationLoop(() => this._frame());
  }

  _bind() {
    window.addEventListener('resize', () => this._resize());
    document.addEventListener('fullscreenchange', () => this._resize());
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    document.getElementById('btn-start').addEventListener('click', () => this.start());
    document.getElementById('btn-restart').addEventListener('click', () => this.restart());
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('btn-pause-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('btn-resume')?.addEventListener('click', () => this.resume());
    document.getElementById('btn-quit')?.addEventListener('click', () => this.quitToMenu());

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' && this.state === 'gameover') this.restart();
      if (e.code === 'KeyE') this._tryPickup(false);
      if (e.code === 'Escape') {
        if (this.state === 'paused' && performance.now() - this._pausedAt > 280) {
          e.preventDefault();
          this.resume();
        } else if (this.state === 'playing' && this.player.alive) {
          this.pause();
        }
      }
    });

    this.canvas.addEventListener('click', () => {
      if (this.state === 'paused') this.resume();
      else if (this.state === 'playing' && this.player.alive) this.player.lock();
    });

    this.player.controls.addEventListener('lock', () => {
      if (this.state === 'paused') this.resume();
    });
    this.player.controls.addEventListener('unlock', () => {
      if (this.state === 'playing' && this.player.alive) this.pause();
    });
  }

  _resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  start() {
    this.sound.resume();
    this.sound.stopMusic();
    this.sound.startMusic();
    this.toggleFullscreen(true);
    this.ui.hideStart();
    this.ui.hideGameOver();
    this.ui.showPause(false);
    this.ui.showHud(true);
    this.state = 'playing';
    this.xp = 0;
    this.player.reset();
    this.weapon.reset();
    this.waves.start();
    this.player.lock();
  }

  pause() {
    if (this.state !== 'playing' || !this.player.alive) return;
    this.state = 'paused';
    this._pausedAt = performance.now();
    this.ui.showPause(true);
    this.player.unlock();
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.ui.showPause(false);
    this.player.lock();
  }

  quitToMenu() {
    this.state = 'menu';
    this.player.unlock();
    this.sound.stopMusic();
    this.waves.reset();
    this.weapon.reset();
    this.player.reset();
    this.ui.showPause(false);
    this.ui.hideGameOver();
    this.ui.showHud(false);
    this.ui.showStart();
  }

  toggleFullscreen(forceOn = false) {
    const root = document.documentElement;
    if (!document.fullscreenElement) {
      root.requestFullscreen?.().catch(() => {});
    } else if (!forceOn) {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  restart() {
    this.start();
  }

  _gameOver() {
    this.state = 'gameover';
    this.sound.stopMusic();
    document.exitPointerLock?.();
    this.ui.showGameOver({
      wave: this.waves.wave,
      xp: this.xp,
      kills: this.player.kills,
    });
  }

  _tryPickup(auto) {
    if (this.state !== 'playing' || !this.player.alive) return;
    for (const pickup of this.world.pickups) {
      if (pickup.taken) continue;
      const dx = pickup.group.position.x - this.player.position.x;
      const dz = pickup.group.position.z - this.player.position.z;
      const range = auto ? 1.15 : 2.3;
      if (dx * dx + dz * dz > range * range) continue;
      pickup.taken = true;
      this.scene.remove(pickup.group, pickup.light);
      this.player.addMedkit();
      this.ui.toast('İLK YARDIM ALINDI');
    }
  }

  _updateTarget() {
    this.camera.getWorldPosition(this._origin);
    this.camera.getWorldDirection(this._dir);
    this.aimRay.set(this._origin, this._dir);
    const living = this.waves.zombies.filter((z) => z.alive).map((z) => z.group);
    if (!living.length) {
      this.ui.setTarget(null);
      return;
    }
    const hits = this.aimRay.intersectObjects(living, true);
    const zombie = hits[0]?.object.userData.zombie;
    this.ui.setTarget(null);
  }

  _applyBlast(blast) {
    this.sound.explode();
    const origin = blast.position;
    const radius = blast.radius;
    for (const z of this.waves.zombies) {
      if (!z.alive) continue;
      const d = z.position.distanceTo(origin);
      if (d > radius) continue;
      const falloff = 1 - d / radius;
      const dir = new THREE.Vector3().subVectors(z.position, origin).setY(0);
      if (dir.lengthSq() < 0.0001) dir.set(1, 0, 0);
      dir.normalize();
      const applied = z.applyHit(Math.ceil(blast.damage * falloff), false, z.position.clone(), dir);
      if (applied.killed) {
        this.player.kills += 1;
        this.xp += applied.xp;
        this.ui.showHit(false, applied.xp);
      }
    }
    const pd = this.player.position.distanceTo(origin);
    if (pd < radius * 0.85) {
      const falloff = 1 - pd / radius;
      if (this.player.takeDamage(Math.ceil(blast.playerDamage * falloff))) this._gameOver();
    }
  }

  _frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed += dt;
    this.world.update(dt, this.elapsed);

    const locked = Boolean(this.player.controls.isLocked);
    const playing = this.state === 'playing' && this.player.alive;

    if (this.state === 'playing') this.player.update(dt);

    const shot = this.weapon.update(
      dt,
      this.input,
      playing && locked,
      this.waves.zombies,
    );
    if (shot?.hit) {
      this.xp += shot.xp;
      this.ui.showHit(shot.headshot, shot.xp);
      if (shot.killed) this.player.kills += 1;
    }
    if (shot?.blast) {
      this._applyBlast(shot.blast);
    }

    if (playing) {
      const events = this.waves.update(dt, this.player);
      for (const attack of events.attacks) {
        if (this.player.takeDamage(attack.damage)) {
          this._gameOver();
          break;
        }
      }
      this._tryPickup(true);
      this._updateTarget();
      this.player.lookDirection(this._dir);
      this.sound.setListener(
        this.player.position.x,
        this.player.position.y,
        this.player.position.z,
        this._dir.x,
        this._dir.z,
      );
    }

    if (this.state !== 'menu') {
      this.ui.update(dt, {
        player: this.player,
        weapon: this.weapon,
        waves: this.waves,
        xp: this.xp,
      });
      this.ui.drawMinimap(this.player, this.waves, this.world);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

const game = new Game();
window.__nightfall = game;
game.init();
