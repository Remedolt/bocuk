import { ASSET_PATHS } from './constants';

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

  enemy(kind: 'walker' | 'runner' | 'tank'): HTMLImageElement | null {
    if (kind === 'runner') return this.get('enemyRunner') ?? this.get('enemy');
    if (kind === 'tank') return this.get('enemyTank') ?? this.get('enemy');
    return this.get('enemy');
  }
}
