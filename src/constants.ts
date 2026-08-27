import type { EnemyDef, EnemyKind, WeaponDef, WeaponId } from './types';

export const GAME = {
  title: 'BÖÖCÜK',
  subtitle: 'OTOMATİK AV',
};

export const ARENA = {
  size: 2200,
  tile: 72,
  wall: 28,
};

export const CAMERA = {
  zoom: 0.92,
  follow: 10,
};

export const WAVE = {
  duration: 45,
  maxAlive: 72,
};

export const PLAYER = {
  radius: 18,
  spriteSize: 52,
  speed: 235,
  maxHp: 100,
  armor: 0,
  damageMul: 1,
  pickupRange: 48,
  magnetRange: 128,
  invulnTime: 0.38,
  orbitRadius: 64,
  orbitSpeed: 1.35,
};

export const WEAPON_DEFS: Record<WeaponId, WeaponDef> = {
  pistol: {
    id: 'pistol',
    name: 'Paslı Tabanca',
    damage: 14,
    fireInterval: 0.42,
    range: 360,
    projectileSpeed: 560,
    projectileRadius: 4,
    pellets: 1,
    spread: 0.04,
    pierce: 0,
    color: '#ffe14a',
    glow: '#fff4a8',
    price: 0,
  },
  smg: {
    id: 'smg',
    name: 'SMG',
    damage: 7,
    fireInterval: 0.11,
    range: 250,
    projectileSpeed: 620,
    projectileRadius: 3.2,
    pellets: 1,
    spread: 0.12,
    pierce: 0,
    color: '#c8c0a8',
    glow: '#ffe08a',
    price: 28,
  },
  shotgun: {
    id: 'shotgun',
    name: 'Saçma',
    damage: 8,
    fireInterval: 0.72,
    range: 170,
    projectileSpeed: 500,
    projectileRadius: 3.5,
    pellets: 6,
    spread: 0.42,
    pierce: 0,
    color: '#e8a05a',
    glow: '#ff7a2a',
    price: 34,
  },
  sniper: {
    id: 'sniper',
    name: 'Keskin Nişancı',
    damage: 58,
    fireInterval: 1.05,
    range: 560,
    projectileSpeed: 920,
    projectileRadius: 4.5,
    pellets: 1,
    spread: 0.01,
    pierce: 2,
    color: '#7ec8ff',
    glow: '#3aa0ff',
    price: 42,
  },
  plasma: {
    id: 'plasma',
    name: 'Plazma',
    damage: 18,
    fireInterval: 0.26,
    range: 320,
    projectileSpeed: 480,
    projectileRadius: 6,
    pellets: 1,
    spread: 0.05,
    pierce: 1,
    color: '#5cf0c8',
    glow: '#2dffb4',
    price: 38,
  },
  minigun: {
    id: 'minigun',
    name: 'Minigun',
    damage: 5,
    fireInterval: 0.055,
    range: 280,
    projectileSpeed: 700,
    projectileRadius: 3,
    pellets: 1,
    spread: 0.16,
    pierce: 0,
    color: '#ffb15c',
    glow: '#ff6a00',
    price: 58,
  },
};

export const STARTER_WEAPON: WeaponId = 'pistol';
export const MAX_WEAPON_SLOTS = 6;

export const ENEMY_DEFS: Record<EnemyKind, EnemyDef> = {
  walker: {
    kind: 'walker',
    name: 'Yürüyen',
    hp: 28,
    speed: 82,
    damage: 8,
    radius: 16,
    xp: 3,
    color: '#c4d46a',
    eye: '#ff2a12',
    spriteSize: 46,
  },
  runner: {
    kind: 'runner',
    name: 'Koşucu',
    hp: 16,
    speed: 150,
    damage: 6,
    radius: 14,
    xp: 4,
    color: '#6a7d4a',
    eye: '#ffcc22',
    spriteSize: 42,
  },
  tank: {
    kind: 'tank',
    name: 'Canavar',
    hp: 96,
    speed: 54,
    damage: 16,
    radius: 24,
    xp: 10,
    color: '#5c5348',
    eye: '#ddf3ff',
    spriteSize: 64,
  },
};

/** Optional drop-in sprites. Missing files fall back to primitives. */
export const ASSET_PATHS = {
  player: './assets/player.png',
  enemy: './assets/enemy.png',
  enemyRunner: './assets/enemy-runner.png',
  enemyTank: './assets/enemy-tank.png',
  weapon: './assets/weapon.png',
  projectile: './assets/projectile.png',
  xp: './assets/xp.png',
  floor: './assets/floor.png',
} as const;
