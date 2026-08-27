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

  startWave(wave: number): void {
    this.wave = wave;
    this.timer = WAVE.duration;
    this.acc = 0.85;
    this.spawning = true;
  }

  interval(): number {
    return Math.max(0.22, 0.78 - (this.wave - 1) * 0.06);
  }

  pickKind(): EnemyKind {
    const w = this.wave;
    const roll = Math.random();
    if (w >= 6 && roll < 0.16) return 'tank';
    if (w >= 3 && roll < 0.42) return 'runner';
    if (w >= 8 && roll < 0.28) return 'tank';
    return 'walker';
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
    this.acc += dt;
    const cap = Math.min(WAVE.maxAlive, 10 + this.wave * 4);
    while (this.acc >= this.interval() && enemies.count() < cap) {
      this.acc -= this.interval();
      const p = this.spawnPoint(player, camera);
      enemies.spawn(this.pickKind(), p.x, p.y, this.wave);
    }
  }
}
