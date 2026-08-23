import * as THREE from 'three';
import { WEAPON, COMBAT, lerp } from './constants.js';

function metal(color, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.42,
    metalness: 0.55,
    fog: false,
    ...extras,
  });
}

function skin() {
  return new THREE.MeshStandardMaterial({ color: 0xe0b48a, roughness: 0.7, metalness: 0, fog: false, emissive: 0x3a2414, emissiveIntensity: 0.2 });
}

function buildAssaultRifle() {
  const root = new THREE.Group();
  const dark = metal(0x1c1f24, { metalness: 0.72, roughness: 0.32 });
  const gun = metal(0x2a3038, { metalness: 0.65, roughness: 0.38 });
  const poly = metal(0x1a1c18, { metalness: 0.12, roughness: 0.78 });
  const magCol = metal(0x2c3324, { metalness: 0.2, roughness: 0.7 });

  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.07, 0.28), gun);
  receiver.position.set(0, 0.01, 0);
  const upper = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.04, 0.26), dark);
  upper.position.set(0, 0.055, -0.02);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.014, 0.22), metal(0x111318, { metalness: 0.8, roughness: 0.28 }));
  rail.position.set(0, 0.078, -0.04);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.011, 0.42, 8), dark);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.02, -0.34);
  const gas = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 6), dark);
  gas.rotation.x = Math.PI / 2;
  gas.position.set(0, 0.042, -0.28);
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.16), poly);
  stock.position.set(0, 0.0, 0.2);
  const stockPad = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.08, 0.03), poly);
  stockPad.position.set(0, -0.01, 0.28);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.1, 0.038), poly);
  grip.position.set(0, -0.08, 0.04);
  grip.rotation.x = 0.32;
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.13, 0.05), magCol);
  mag.position.set(0, -0.11, -0.02);
  mag.rotation.x = 0.1;
  const magWell = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.035, 0.06), gun);
  magWell.position.set(0, -0.04, -0.02);
  const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.045, 0.18), dark);
  handguard.position.set(0, 0.012, -0.2);
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.045, 8), dark);
  muzzle.rotation.x = Math.PI / 2;
  muzzle.position.set(0, 0.02, -0.56);

  const sight = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.03, 0.045), dark);
  sight.position.set(0, 0.098, 0.02);
  const sightGlass = new THREE.Mesh(
    new THREE.CircleGeometry(0.008, 10),
    new THREE.MeshBasicMaterial({ color: 0x33ff66, fog: false }),
  );
  sightGlass.position.set(0, 0.11, 0.042);

  const glove = metal(0x2a241c, { metalness: 0.08, roughness: 0.86 });
  const palmR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.028, 0.07), glove);
  palmR.position.set(0.04, -0.07, 0.04);
  palmR.rotation.z = -0.35;
  const palmL = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.026, 0.06), glove);
  palmL.position.set(-0.038, -0.01, -0.16);
  palmL.rotation.z = 0.28;

  root.add(
    receiver, upper, rail, barrel, gas, stock, stockPad, grip, mag, magWell,
    handguard, muzzle, sight, sightGlass, palmR, palmL,
  );
  root.userData.muzzleLocal = new THREE.Vector3(0, 0.02, -0.58);
  root.userData.magazine = mag;
  return root;
}

function flashTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,230,1)');
  g.addColorStop(0.25, 'rgba(255,200,80,0.9)');
  g.addColorStop(1, 'rgba(255,80,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Weapon {
  constructor(camera, scene, world, sound, assets) {
    this.camera = camera;
    this.scene = scene;
    this.world = world;
    this.sound = sound;

    this.root = new THREE.Group();
    const imported = assets?.clone('weapon');
    if (imported) {
      imported.scale.setScalar(0.9);
      imported.position.set(0, -0.05, 0);
      this.model = imported;
    } else {
      this.model = buildAssaultRifle();
    }
    this.root.add(this.model);
    this.root.position.set(0.21, -0.25, -0.5);
    this.root.rotation.set(0.04, 0.08, -0.02);
    this.root.scale.setScalar(1.05);
    camera.add(this.root);

    this.viewLight = new THREE.PointLight(0xffe6c4, 3.2, 1.6, 1.4);
    this.viewLight.position.set(0.02, 0.18, 0.22);
    this.root.add(this.viewLight);

    this.flashSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: flashTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    this.flashSprite.scale.set(0.18, 0.18, 1);
    this.flashSprite.visible = false;
    this.flashSprite.position.copy(this.model.userData.muzzleLocal || new THREE.Vector3(0, 0.02, -0.54));
    this.model.add(this.flashSprite);

    this.muzzleLight = new THREE.PointLight(0xffcc66, 0, 8, 2);
    this.muzzleLight.position.copy(this.flashSprite.position);
    this.model.add(this.muzzleLight);

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = WEAPON.range;
    this.shootOrigin = new THREE.Vector3();
    this.shootDir = new THREE.Vector3();
    this.hitPoint = new THREE.Vector3();
    this.muzzleWorld = new THREE.Vector3();

    this.mag = WEAPON.magSize;
    this.reserve = WEAPON.reserve;
    this.cooldown = 0;
    this.reloading = false;
    this.reloadT = 0;
    this.recoil = 0;
    this.recoilYaw = 0;
    this.ads = 0;
    this.flashT = 0;
    this.firing = false;
    this.wantReload = false;

    this.tracers = [];
    this.impacts = [];
    this._tracerGeo = new THREE.BoxGeometry(0.02, 0.02, 1);
    this._tracerMat = new THREE.MeshBasicMaterial({
      color: 0xffe08a,
      transparent: true,
      opacity: 0.85,
    });

    this.aiming = false;
    this._onDown = (e) => {
      if (e.button === 0) this.firing = true;
      if (e.button === 2) this.aiming = true;
    };
    this._onUp = (e) => {
      if (e.button === 0) this.firing = false;
      if (e.button === 2) this.aiming = false;
    };
    this._onKey = (e) => {
      if (e.code === 'KeyR') this.wantReload = true;
    };
    document.addEventListener('mousedown', this._onDown);
    document.addEventListener('mouseup', this._onUp);
    document.addEventListener('keydown', this._onKey);
  }

  get adsActive() {
    return this.ads > 0.55;
  }

  reset() {
    this.mag = WEAPON.magSize;
    this.reserve = WEAPON.reserve;
    this.cooldown = 0;
    this.reloading = false;
    this.reloadT = 0;
    this.recoil = 0;
    this.recoilYaw = 0;
    this.ads = 0;
    this.flashT = 0;
    this.firing = false;
    this.wantReload = false;
    this.clearEffects();
  }

  clearEffects() {
    for (const t of this.tracers) this.scene.remove(t.mesh);
    for (const i of this.impacts) this.scene.remove(i.mesh);
    this.tracers.length = 0;
    this.impacts.length = 0;
  }

  tryReload() {
    if (this.reloading || this.mag >= WEAPON.magSize || this.reserve <= 0) return;
    this.reloading = true;
    this.reloadT = 0;
    this.sound.reload();
  }

  tryFire(canShoot, zombies) {
    if (!canShoot || this.reloading) return null;
    if (this.mag <= 0) {
      this.sound.empty();
      this.cooldown = 0.22;
      this.tryReload();
      return { empty: true };
    }
    this.mag -= 1;
    this.cooldown = WEAPON.fireInterval;
    this.recoil += WEAPON.recoilPitch;
    this.recoilYaw += (Math.random() - 0.5) * WEAPON.recoilYaw;
    this.flashT = 0.05;
    this.sound.fire();
    this.sound.casing();

    this.camera.getWorldPosition(this.shootOrigin);
    this.camera.getWorldDirection(this.shootDir);
    this.raycaster.set(this.shootOrigin, this.shootDir);

    const zombieMeshes = [];
    for (const z of zombies) {
      if (!z.alive) continue;
      zombieMeshes.push(z.group);
    }
    const zombieHits = this.raycaster.intersectObjects(zombieMeshes, true);
    const worldHits = this.raycaster.intersectObjects(this.world.staticMeshes, true);
    const zombieHit = zombieHits[0];
    const worldHit = worldHits[0];
    const hitZombie =
      zombieHit && (!worldHit || zombieHit.distance <= worldHit.distance + 0.7);

    this.model.updateWorldMatrix(true, false);
    this.flashSprite.getWorldPosition(this.muzzleWorld);

    let result = { hit: false, headshot: false, killed: false, xp: 0, zombie: null, point: null };

    if (hitZombie) {
      const hit = zombieHit;
      this.hitPoint.copy(hit.point);
      this._spawnTracer(this.muzzleWorld, hit.point);
      const zombie = hit.object.userData.zombie;
      if (zombie && zombie.alive) {
        const local = zombie.group.worldToLocal(hit.point.clone());
        const headshot =
          hit.object.userData.part === 'head' || local.y > COMBAT.headHeight;
        const applied = zombie.applyHit(WEAPON.damage, headshot, hit.point, this.shootDir);
        result = {
          hit: true,
          headshot,
          killed: applied.killed,
          xp: applied.xp,
          zombie,
          point: hit.point.clone(),
        };
        this.sound.hit(headshot);
      }
    } else if (worldHit) {
      this.hitPoint.copy(worldHit.point);
      this._spawnTracer(this.muzzleWorld, worldHit.point);
      const barrel = worldHit.object.userData.barrel;
      if (barrel && !barrel.exploded) {
        result.blast = this.world.explodeBarrel(barrel);
      } else {
        this._spawnImpact(worldHit.point, worldHit.face?.normal);
      }
    } else {
      const far = this.shootOrigin.clone().addScaledVector(this.shootDir, WEAPON.range);
      this._spawnTracer(this.muzzleWorld, far);
    }

    if (this.mag === 0) this.tryReload();
    return result;
  }

  _spawnTracer(from, to) {
    const mesh = new THREE.Mesh(this._tracerGeo, this._tracerMat.clone());
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    mesh.scale.set(1, 1, len);
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.lookAt(to);
    this.scene.add(mesh);
    this.tracers.push({ mesh, life: WEAPON.tracerLife });
  }

  _spawnImpact(point, normal) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffcc88 }),
    );
    mesh.position.copy(point);
    if (normal) mesh.position.addScaledVector(normal, 0.04);
    this.scene.add(mesh);
    this.impacts.push({ mesh, life: 0.12 });
  }

  update(dt, input, canShoot, zombies) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.flashT = Math.max(0, this.flashT - dt);
    this.flashSprite.visible = this.flashT > 0;
    this.flashSprite.material.rotation = Math.random() * Math.PI;
    this.muzzleLight.intensity = this.flashT > 0 ? 12 : 0;

    void input;
    const adsTarget = this.aiming && canShoot && !this.reloading ? 1 : 0;
    this.ads = lerp(this.ads, adsTarget, 1 - Math.pow(0.0008, dt));

    const hip = new THREE.Vector3(0.21, -0.25, -0.5);
    const ads = new THREE.Vector3(0.0, -0.2, -0.38);
    this.root.position.lerpVectors(hip, ads, this.ads);

    if (this.reloading) {
      this.reloadT += dt;
      const k = this.reloadT / WEAPON.reloadTime;
      this.root.rotation.x = Math.sin(Math.min(k, 1) * Math.PI) * 0.35;
      if (this.model.userData.magazine) {
        this.model.userData.magazine.position.y = -0.12 - Math.sin(Math.min(k, 1) * Math.PI) * 0.08;
      }
      if (this.reloadT >= WEAPON.reloadTime) {
        const need = WEAPON.magSize - this.mag;
        const take = Math.min(need, this.reserve);
        this.mag += take;
        this.reserve -= take;
        this.reloading = false;
        this.reloadT = 0;
        this.root.rotation.x = 0;
      }
    } else {
      this.root.rotation.x = lerp(this.root.rotation.x, -this.recoil * 2.2, 12 * dt);
      this.root.rotation.y = lerp(this.root.rotation.y, this.recoilYaw, 10 * dt);
    }

    this.recoil = lerp(this.recoil, 0, 8 * dt);
    this.recoilYaw = lerp(this.recoilYaw, 0, 8 * dt);

    this.camera.fov = lerp(WEAPON.hipFov, WEAPON.adsFov, this.ads);
    this.camera.updateProjectionMatrix();

    if (this.wantReload) {
      this.wantReload = false;
      this.tryReload();
    }

    let shot = null;
    if (this.firing && this.cooldown <= 0) {
      shot = this.tryFire(canShoot, zombies);
      if (shot?.empty) this.firing = false;
    }

    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life -= dt;
      t.mesh.material.opacity = Math.max(0, t.life / WEAPON.tracerLife);
      if (t.life <= 0) {
        this.scene.remove(t.mesh);
        t.mesh.material.dispose();
        this.tracers.splice(i, 1);
      }
    }
    for (let i = this.impacts.length - 1; i >= 0; i--) {
      const p = this.impacts[i];
      p.life -= dt;
      p.mesh.scale.multiplyScalar(1.08);
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.impacts.splice(i, 1);
      }
    }

    return shot;
  }

  dispose() {
    document.removeEventListener('mousedown', this._onDown);
    document.removeEventListener('mouseup', this._onUp);
    document.removeEventListener('keydown', this._onKey);
    this.camera.remove(this.root);
    this.clearEffects();
  }
}
