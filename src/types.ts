export type GameState =
  | 'menu'
  | 'hero'
  | 'loadout'
  | 'playing'
  | 'clearing'
  | 'shop'
  | 'paused'
  | 'gameover';

export interface HuntTarget {
  alive: boolean;
  x: number;
  y: number;
}

export type EnemyKind = 'walker' | 'runner' | 'beetle' | 'wasp' | 'tank' | 'spitter' | 'boss';

export type WeaponId = 'pistol' | 'smg' | 'shotgun' | 'sniper' | 'plasma' | 'minigun';

export type HeroId = 'kurtcuk' | 'kabuk' | 'isik' | 'suru';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  damage: number;
  fireInterval: number;
  range: number;
  projectileSpeed: number;
  projectileRadius: number;
  pellets: number;
  spread: number;
  pierce: number;
  color: string;
  glow: string;
  price: number;
}

export interface EnemyDef {
  kind: EnemyKind;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  radius: number;
  xp: number;
  color: string;
  eye: string;
  spriteSize: number;
}

export interface HeroDef {
  id: HeroId;
  name: string;
  blurb: string;
  maxHp: number;
  speed: number;
  armor: number;
  damageMul: number;
  pickupRange: number;
  magnetRange: number;
  body: string;
  shell: string;
  skin: string;
  eye: string;
  accent: string;
}

export interface ArenaTheme {
  name: string;
  clear: string;
  floor: [number, number, number];
  accent: string;
  wall: string;
  wallInner: string;
}

export interface ShopOffer {
  id: string;
  title: string;
  desc: string;
  cost: number;
  tint: string;
  apply: () => boolean;
}
