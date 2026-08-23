import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const OPTIONAL_MODELS = {
  zombie: './models/zombie.glb',
  weapon: './models/weapon.glb',
};

/**
 * Tries to load optional glTF assets. Missing files are expected —
 * placeholder geometry in Weapon.js / Zombie.js keeps the game fully playable.
 */
export class Assets {
  constructor() {
    this.loader = new GLTFLoader();
    this.models = {
      zombie: null,
      weapon: null,
    };
  }

  async loadAll() {
    const entries = Object.entries(OPTIONAL_MODELS);
    await Promise.all(
      entries.map(async ([key, url]) => {
        this.models[key] = await this._tryLoad(url);
      }),
    );
    return this.models;
  }

  async _tryLoad(url) {
    try {
      const gltf = await this.loader.loadAsync(url);
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      return gltf.scene;
    } catch {
      return null;
    }
  }

  clone(key) {
    const src = this.models[key];
    return src ? src.clone(true) : null;
  }
}
