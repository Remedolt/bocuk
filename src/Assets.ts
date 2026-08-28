import { ASSET_PATHS } from './constants';
import type { EnemyKind } from './types';

export type AssetKey = keyof typeof ASSET_PATHS;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export class Assets {
  images: Partial<Record<AssetKey, HTMLImageElement>> = {};

  async loadAll(): Promise<void> {
    const entries = await Promise.all(
      (Object.keys(ASSET_PATHS) as AssetKey[]).map(async (key) => {
        const img = await loadImage(ASSET_PATHS[key]);
        return [key, img] as const;
      }),
    );
    for (const [key, img] of entries) {
      if (img) this.images[key] = img;
    }
  }

  get(key: AssetKey): HTMLImageElement | null {
    return this.images[key] ?? null;
  }

  enemy(kind: EnemyKind): HTMLImageElement | null {
    if (kind === 'runner') return this.get('enemyRunner');
    if (kind === 'tank') return this.get('enemyTank');
    if (kind === 'beetle') return this.get('enemyBeetle');
    if (kind === 'wasp') return this.get('enemyWasp');
    if (kind === 'spitter') return this.get('enemySpitter');
    if (kind === 'boss') return this.get('enemyBoss');
    return this.get('enemy');
  }
}
