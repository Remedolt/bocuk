export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const rand = (min: number, max: number): number => min + Math.random() * (max - min);

export const randInt = (min: number, max: number): number => Math.floor(rand(min, max + 1));

export const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]!;

export const distSq = (ax: number, ay: number, bx: number, by: number): number => {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
};

export const dist = (ax: number, ay: number, bx: number, by: number): number =>
  Math.hypot(ax - bx, ay - by);

export const angleTo = (ax: number, ay: number, bx: number, by: number): number =>
  Math.atan2(by - ay, bx - ax);

export const hash2 = (ix: number, iy: number): number => {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
