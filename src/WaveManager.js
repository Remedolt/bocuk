import * as THREE from 'three';
import { Zombie } from './Zombie.js';
import { WAVES, rand } from './constants.js';

export class WaveManager {
  constructor(scene, world, sound, assets) {
    this.scene = scene;
    this.world = world;
    this.sound = sound;
    this.assets = assets;
    this.zombies = [];
    this.wave = 0;
    this.state = 'idle';
    this.timer = 0;
    this.queue = [];
    this.spawnAcc = 0;
    this.onBanner = null;
    this.onWaveClear = null;
  }

  get aliveCount() {
    return this.zombies.filter((z) => z.alive).length;
  }

  get remaining() {
    return this.queue.length + this.aliveCount;
  }

  start() {
    this.reset();
    this._beginWave(1);
  }

  reset() {
    for (const z of this.zombies) z.dispose();
    this.zombies.length = 0;
    this.queue.length = 0;
    this.wave = 0;
    this.state = 'idle';
    this.timer = 0;
    this.spawnAcc = 0;
    this.world.clearPickups();
  }

  _compose(wave) {
    const count = Math.min(6 + wave * 3, 42);
    const list = [];
    for (let i = 0; i < count; i++) {
      let type = 'walker';
      const runnerChance = wave >= 3 ? 0.16 + wave * 0.025 : 0;
      const tankChance = wave >= 6 ? 0.08 + (wave - 6) * 0.02 : 0;
      const roll = Math.random();
      if (roll < tankChance) type = 'tank';
      else if (roll < tankChance + runnerChance) type = 'runner';
      list.push(type);
    }
    return list;
  }

  _beginWave(wave) {
    this.wave = wave;
    this.queue = this._compose(wave);
    this.state = 'prep';
    this.timer = WAVES.prepTime;
    this.spawnAcc = 0;
    this.sound.wave();
    this.onBanner?.(`DALGA ${wave}`, 'HAZIRLAN');
  }

  _pickSpawn(playerPos) {
    const far = this.world.spawnPoints.filter((p) => p.distanceTo(playerPos) > 16);
    const pool = far.length ? far : this.world.spawnPoints;
    for (let attempt = 0; attempt < 16; attempt++) {
      const base = pool[Math.floor(Math.random() * pool.length)].clone();
      base.x += rand(-1.2, 1.2);
      base.z += rand(-1.2, 1.2);
      const open = this.world.findOpen(base.x, base.z, 0.55);
      if (open) {
        return new THREE.Vector3(open.x, 0, open.z);
      }
    }
    const fallbackZ = playerPos.z > 0 ? -46 : 46;
    const open = this.world.findOpen(0, fallbackZ, 0.55);
    return new THREE.Vector3(open?.x ?? 0, 0, open?.z ?? fallbackZ);
  }

  _spawnOne(playerPos) {
    const type = this.queue.shift();
    if (!type) return;
    const pos = this._pickSpawn(playerPos);
    const zombie = new Zombie(this.scene, this.world, this.sound, this.assets, type, pos, this.wave);
    this.zombies.push(zombie);
  }

  update(dt, player) {
    const events = { attacks: [], banner: null };

    if (this.state === 'prep') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.state = 'combat';
        this.onBanner?.(`DALGA ${this.wave}`, 'GELİYORLAR');
      }
      return events;
    }

    if (this.state === 'clear') {
      this.timer -= dt;
      if (this.timer <= 0) this._beginWave(this.wave + 1);
      return events;
    }

    if (this.state !== 'combat') return events;

    this.spawnAcc += dt;
    while (
      this.queue.length &&
      this.aliveCount < WAVES.maxAlive &&
      this.spawnAcc >= WAVES.spawnInterval
    ) {
      this.spawnAcc -= WAVES.spawnInterval;
      this._spawnOne(player.position);
    }

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];
      const result = z.update(dt, player, this.zombies);
      if (result.attacked) {
        events.attacks.push({ damage: result.damage, zombie: z });
      }
      if (z.remove) this.zombies.splice(i, 1);
    }

    if (this.queue.length === 0 && this.aliveCount === 0) {
      this.state = 'clear';
      this.timer = 3.2;
      this.onBanner?.('DALGA TEMİZ', 'SONRAKİ 3 SANİYE');
      this.onWaveClear?.(this.wave);
      if (Math.random() < WAVES.medkitChance) {
        const offset = new THREE.Vector3(rand(-4, 4), 0, rand(-4, 4));
        const p = player.position.clone().add(offset);
        const c = this.world.clampInside(p.x, p.z);
        this.world.spawnPickup(new THREE.Vector3(c.x, 0, c.z));
      }
    }

    return events;
  }
}
