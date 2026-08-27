export type GameState = 'menu' | 'playing' | 'clearing' | 'shop' | 'paused' | 'gameover';

export interface Vec2 {
  x: number;
  y: number;
}

export type EnemyKind = 'walker' | 'runner' | 'tank';

export type WeaponId = 'pistol' | 'smg' | 'shotgun' | 'sniper' | 'plasma' | 'minigun';

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

export interface ShopOffer {
  id: string;
  title: string;
  desc: string;
  cost: number;
  tint: string;
  apply: () => boolean;
}
