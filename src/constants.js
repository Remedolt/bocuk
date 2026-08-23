export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (min, max) => min + Math.random() * (max - min);
export const randInt = (min, max) => Math.floor(rand(min, max + 1));
export const pick = (list) => list[Math.floor(Math.random() * list.length)];

export const GAME = {
  title: 'ZOMBİ BÜKÜCÜ',
  subtitle: 'Şehrin Ortası',
};

export const PLAYER = {
  height: 1.68,
  radius: 0.4,
  walkSpeed: 6.35,
  sprintSpeed: 10.1,
  jumpSpeed: 7.6,
  gravity: 24,
  maxHealth: 100,
  medkitHeal: 48,
  hurtInvuln: 0.35,
};

export const WEAPON = {
  magSize: 30,
  reserve: 180,
  damage: 34,
  headshotMultiplier: 2.5,
  fireInterval: 0.092,
  reloadTime: 2.08,
  range: 92,
  recoilPitch: 0.022,
  recoilYaw: 0.01,
  adsFov: 50,
  hipFov: 75,
  tracerLife: 0.07,
};

export const ZOMBIE_TYPES = {
  walker: {
    name: 'Yürüyen',
    health: 100,
    speed: 1.62,
    damage: 10,
    scale: 1,
    xpBody: 50,
    xpHead: 150,
    color: 0xb8a070,
    eye: 0xff2a12,
    groanRate: [2.2, 4.2],
  },
  runner: {
    name: 'Koşucu',
    health: 58,
    speed: 3.25,
    damage: 8,
    scale: 0.92,
    xpBody: 70,
    xpHead: 180,
    color: 0x6d7a55,
    eye: 0xffcc22,
    groanRate: [1.4, 2.8],
  },
  tank: {
    name: 'Canavar',
    health: 280,
    speed: 1.18,
    damage: 18,
    scale: 1.28,
    xpBody: 90,
    xpHead: 220,
    color: 0x5c5348,
    eye: 0xddf3ff,
    groanRate: [2.6, 5],
  },
};

export const COMBAT = {
  attackRange: 1.78,
  attackCooldown: 1.12,
  headHeight: 1.34,
};

export const WAVES = {
  prepTime: 4.2,
  spawnInterval: 0.62,
  maxAlive: 18,
  medkitChance: 0.55,
};

export const WORLD = {
  halfSize: 56,
  roadHalf: 8,
};
