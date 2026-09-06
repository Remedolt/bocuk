import { ARENA, WAVE } from './constants';
import { rand, randInt } from './math';
import type { Camera } from './Camera';
import type { EnemyPool } from './Enemy';
import type { EnemyKind } from './types';
import type { Player } from './Player';

export class Spawner {
  wave = 1;
  timer = 0;
  acc = 0;
  spawning = false;
  bossSpawned = false;

  isBossWave(): boolean {
    return this.wave > 0 && this.wave % WAVE.bossEvery === 0;
  }

  startWave(wave: number): void {
    this.wave = wave;
    this.timer = this.isBossWave() ? WAVE.duration + 10 : WAVE.duration;
    this.acc = 0.85;
    this.spawning = true;
    this.bossSpawned = false;
  }

  interval(): number {
    const hard = 0.72 / WAVE.difficulty;
    return Math.max(0.14, hard - (this.wave - 1) * 0.065);
  }

  pickKind(): EnemyKind {
    const w = this.wave;
    const bag: { kind: EnemyKind; n: number }[] = [{ kind: 'walker', n: 12 }];
    if (w >= 2) bag.push({ kind: 'runner', n: 7 });
    if (w >= 3) bag.push({ kind: 'beetle', n: 5 });
    if (w >= 3) bag.push({ kind: 'spitter', n: 4 });
    if (w >= 4) bag.push({ kind: 'wasp', n: 6 });
    if (w >= 5) bag.push({ kind: 'tank', n: 4 });
    if (w >= 8) {
      bag.push({ kind: 'tank', n: 4 });
      bag.push({ kind: 'wasp', n: 5 });
    }
    let total = 0;
    for (const item of bag) total += item.n;
    let roll = Math.random() * total;
    for (const item of bag) {
      roll -= item.n;
      if (roll <= 0) return item.kind;
    }
    return 'walker';
  }

  introLine(): string {
    const w = this.wave;
    if (this.isBossWave()) return 'PATRON GELİYOR';
    if (w > 1 && (w - 1) % WAVE.bossEvery === 0) return 'YENİ KOVA';
    if (w <= 1) return 'LARVALAR UYANDI';
    if (w === 2) return 'SIÇRAYANLAR KARIŞTI';
    if (w === 3) return 'KABUKLU BÖCEKLER';
    if (w === 4) return 'EŞEKARILARI';
    if (w === 6) return 'KARIŞIK SÜRÜ';
    return 'TÜKÜRENLER DE VAR';
  }

  spawnPoint(player: Player, camera: Camera): { x: number; y: number } {
    const dist = Math.min(
      Math.max(camera.visibleRadius() * 0.78, 240),
      ARENA.size / 2 - 80,
    );
    for (let i = 0; i < 8; i += 1) {
      const a = rand(0, Math.PI * 2);
      const x = player.x + Math.cos(a) * dist;
      const y = player.y + Math.sin(a) * dist;
      const limit = ARENA.size / 2 - 40;
      if (Math.abs(x) <= limit && Math.abs(y) <= limit) return { x, y };
    }
    const edge = ARENA.size / 2 - 48;
    const side = randInt(0, 3);
    if (side === 0) return { x: rand(-edge, edge), y: -edge };
    if (side === 1) return { x: rand(-edge, edge), y: edge };
    if (side === 2) return { x: -edge, y: rand(-edge, edge) };
    return { x: edge, y: rand(-edge, edge) };
  }

  update(dt: number, enemies: EnemyPool, player: Player, camera: Camera): void {
    if (!this.spawning) return;
    this.timer = Math.max(0, this.timer - dt);
    if (this.timer <= 0) {
      this.spawning = false;
      return;
    }

    if (this.isBossWave() && !this.bossSpawned) {
      const p = this.spawnPoint(player, camera);
      enemies.spawn('boss', p.x, p.y, this.wave);
      this.bossSpawned = true;
    }

    this.acc += dt;
    const cap = this.isBossWave()
      ? Math.min(WAVE.maxAlive, 12 + this.wave * 3)
      : Math.min(WAVE.maxAlive, Math.round((13 + this.wave * 5) * WAVE.difficulty));
    const burst = this.wave >= 3 ? 2 : 1;
    while (this.acc >= this.interval() && enemies.count() < cap) {
      this.acc -= this.interval();
      for (let i = 0; i < burst && enemies.count() < cap; i += 1) {
        const p = this.spawnPoint(player, camera);
        enemies.spawn(this.pickKind(), p.x, p.y, this.wave);
      }
    }
  }
}
