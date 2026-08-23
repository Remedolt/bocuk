import * as THREE from 'three';
import { COMBAT, ZOMBIE_TYPES, rand } from './constants.js';

function tag(mesh, zombie, part) {
  mesh.userData.zombie = zombie;
  mesh.userData.part = part;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

function buildPlaceholder(zombie, type) {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({
    color: type.color,
    roughness: 0.84,
    metalness: 0.04,
    emissive: type.color,
    emissiveIntensity: 0.05,
  });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x3a4638, roughness: 0.9, metalness: 0.02 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2c28, roughness: 0.88 });
  const stain = new THREE.MeshStandardMaterial({ color: 0x5a2418, roughness: 0.8 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.64, 0.26), cloth);
  torso.position.y = 1.05;
  tag(torso, zombie, 'body');

  const tear = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.05), stain);
  tear.position.set(0.08, 1.08, 0.14);

  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.24), dark);
  pelvis.position.y = 0.68;
  tag(pelvis, zombie, 'body');

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), skin);
  head.scale.set(1.05, 1.12, 0.95);
  head.position.y = 1.55;
  tag(head, zombie, 'head');

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.3), dark);
  hair.position.set(0, 1.72, -0.02);

  const eyeMat = new THREE.MeshBasicMaterial({ color: type.eye, fog: false });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
  const eyeR = eyeL.clone();
  eyeL.position.set(-0.06, 1.58, 0.14);
  eyeR.position.set(0.06, 1.58, 0.14);

  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.12), dark);
  jaw.position.set(0, 1.38, 0.1);

  const makeArm = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(0.33 * side, 1.32, 0.06);
    const limb = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.54, 0.13), skin);
    limb.position.set(0, -0.26, 0.04);
    tag(limb, zombie, 'body');
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.16), cloth);
    sleeve.position.set(0, -0.08, 0.02);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.12), skin);
    hand.position.set(0, -0.52, 0.08);
    pivot.add(limb, sleeve, hand);
    pivot.rotation.z = side * 0.22;
    pivot.rotation.x = -0.55;
    return pivot;
  };
  const armL = makeArm(-1);
  const armR = makeArm(1);

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.58, 0.17), dark);
  const legR = legL.clone();
  legL.position.set(-0.12, 0.32, 0);
  legR.position.set(0.12, 0.32, 0);
  tag(legL, zombie, 'body');
  tag(legR, zombie, 'body');

  group.add(torso, tear, pelvis, head, hair, eyeL, eyeR, jaw, armL, armR, legL, legR);
  group.userData.parts = { head, jaw, armL, armR, legL, legR, torso, eyes: [eyeL, eyeR] };
  return group;
}

export class Zombie {
  constructor(scene, world, sound, assets, typeKey, position, wave) {
    this.scene = scene;
    this.world = world;
    this.sound = sound;
    this.typeKey = typeKey;
    this.type = ZOMBIE_TYPES[typeKey];
    this.wave = wave;

    const hpScale = 1 + (wave - 1) * 0.16;
    const spdScale = 1 + (wave - 1) * 0.045;
    this.maxHealth = Math.round(this.type.health * hpScale);
    this.health = this.maxHealth;
    this.speed = this.type.speed * spdScale;
    this.damage = this.type.damage + Math.floor((wave - 1) * 1.2);

    this.alive = true;
    this.deadT = 0;
    this.attackCd = rand(0.2, 0.8);
    this.groanCd = rand(...this.type.groanRate);
    this.flashT = 0;
    this.walkPhase = Math.random() * Math.PI * 2;
    this.attacking = false;
    this.attackT = 0;
    this.remove = false;
    this.hitYaw = 0;
    this.stuckT = 0;

    this.dir = new THREE.Vector3();
    this.sep = new THREE.Vector3();
    this.side = new THREE.Vector3();

    const imported = assets?.clone('zombie');
    if (imported) {
      this.group = imported;
      this.group.traverse((child) => {
        if (!child.isMesh) return;
        const name = (child.name || '').toLowerCase();
        const part = name.includes('head') || name.includes('skull') ? 'head' : 'body';
        tag(child, this, part);
      });
      this.placeholder = false;
    } else {
      this.group = buildPlaceholder(this, this.type);
      this.placeholder = true;
    }

    this.group.scale.setScalar(this.type.scale);
    this.group.position.copy(position);
    this.group.position.y = 0;
    scene.add(this.group);

    this.blood = [];
  }

  get position() {
    return this.group.position;
  }

  applyHit(baseDamage, headshot, point, incomingDir) {
    if (!this.alive) return { killed: false, xp: 0 };
    const dmg = headshot ? baseDamage * 2.5 : baseDamage;
    this.health = Math.max(0, this.health - dmg);
    this.flashT = 0.12;
    this.hitYaw = Math.atan2(incomingDir.x, incomingDir.z);
    this.group.position.addScaledVector(incomingDir, headshot ? 0.18 : 0.1);
    this._burstBlood(point, incomingDir, headshot);

    if (this.health <= 0) {
      this.alive = false;
      this.deadT = 0;
      const xp = headshot ? this.type.xpHead : this.type.xpBody;
      return { killed: true, xp };
    }
    return { killed: false, xp: headshot ? this.type.xpHead : this.type.xpBody };
  }

  _burstBlood(point, dir, headshot) {
    const n = headshot ? 14 : 8;
    for (let i = 0; i < n; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(headshot ? 0.035 : 0.025, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0x8a0000 }),
      );
      mesh.position.copy(point);
      const vel = new THREE.Vector3(
        dir.x + (Math.random() - 0.5) * 1.4,
        0.6 + Math.random() * 1.2,
        dir.z + (Math.random() - 0.5) * 1.4,
      ).multiplyScalar(2.4);
      this.scene.add(mesh);
      this.blood.push({ mesh, vel, life: 0.45 + Math.random() * 0.25 });
    }
  }

  update(dt, player, others) {
    for (let i = this.blood.length - 1; i >= 0; i--) {
      const b = this.blood[i];
      b.life -= dt;
      b.vel.y -= 9 * dt;
      b.mesh.position.addScaledVector(b.vel, dt);
      if (b.life <= 0 || b.mesh.position.y < 0.02) {
        this.scene.remove(b.mesh);
        this.blood.splice(i, 1);
      }
    }

    if (!this.alive) {
      this.deadT += dt;
      this.group.rotation.x = THREE.MathUtils.lerp(this.group.rotation.x, -Math.PI / 2, 1 - Math.pow(0.02, dt));
      this.group.position.y = THREE.MathUtils.lerp(this.group.position.y, 0.12, 6 * dt);
      if (this.deadT > 2.2) {
        this.dispose();
        this.remove = true;
      }
      return { attacked: false };
    }

    if (this.flashT > 0) {
      this.flashT -= dt;
      this.group.traverse((c) => {
        if (c.isMesh && c.material && c.material.emissive) {
          c.material.emissive = c.material.emissive || new THREE.Color(0x000000);
          c.material.emissive.setHex(this.flashT > 0 ? 0x550000 : 0x000000);
        }
      });
    }

    this.groanCd -= dt;
    if (this.groanCd <= 0) {
      this.sound.groan(this.position.x, 1.2, this.position.z, this.typeKey === 'tank' ? 1.3 : 1);
      this.groanCd = rand(...this.type.groanRate);
    }

    if (this.world.intersectsRadius(this.position.x, this.position.z, 0.42, 0.9)) {
      const out = this.world.pushOut(this.position.x, this.position.z, 0.5);
      this.position.x = out.x;
      this.position.z = out.z;
    }

    const playerPos = player.position;
    this.dir.set(playerPos.x - this.position.x, 0, playerPos.z - this.position.z);
    const dist = this.dir.length();
    if (dist > 0.0001) this.dir.multiplyScalar(1 / dist);

    this.sep.set(0, 0, 0);
    for (const other of others) {
      if (other === this || !other.alive) continue;
      const ox = this.position.x - other.position.x;
      const oz = this.position.z - other.position.z;
      const d2 = ox * ox + oz * oz;
      if (d2 < 1.1 && d2 > 0.0001) {
        this.sep.x += ox / d2;
        this.sep.z += oz / d2;
      }
    }

    this.attackCd = Math.max(0, this.attackCd - dt);
    let attacked = false;

    if (dist < COMBAT.attackRange) {
      this.attacking = true;
      this.attackT += dt;
      if (this.attackCd <= 0 && player.alive) {
        this.attackCd = COMBAT.attackCooldown;
        this.sound.attack();
        attacked = true;
      }
    } else {
      this.attacking = false;
      this.attackT = 0;
      this.dir.addScaledVector(this.sep, 0.35).normalize();

      if (this.world.blockedAhead(this.position, this.dir, 1.4)) {
        this.side.set(-this.dir.z, 0, this.dir.x);
        if (this.world.blockedAhead(this.position, this.side, 1.2)) this.side.multiplyScalar(-1);
        this.dir.lerp(this.side, 0.75).normalize();
      }

      const step = this.speed * dt;
      const nx = this.position.x + this.dir.x * step;
      const nz = this.position.z + this.dir.z * step;
      let moved = false;
      if (!this.world.intersectsRadius(nx, nz, 0.38, 0.9)) {
        this.position.x = nx;
        this.position.z = nz;
        moved = true;
      } else {
        const left = new THREE.Vector3(-this.dir.z, 0, this.dir.x);
        if (!this.world.intersectsRadius(this.position.x + left.x * step, this.position.z + left.z * step, 0.38, 0.9)) {
          this.position.x += left.x * step;
          this.position.z += left.z * step;
          moved = true;
        } else if (!this.world.intersectsRadius(this.position.x - left.x * step, this.position.z - left.z * step, 0.38, 0.9)) {
          this.position.x -= left.x * step;
          this.position.z -= left.z * step;
          moved = true;
        }
      }
      if (moved) this.stuckT = 0;
      else {
        this.stuckT += dt;
        if (this.stuckT > 0.55) {
          const out = this.world.pushOut(this.position.x, this.position.z, 0.55);
          this.position.x = out.x;
          this.position.z = out.z;
          this.stuckT = 0;
        }
      }

      const clamped = this.world.clampInside(this.position.x, this.position.z);
      this.position.x = clamped.x;
      this.position.z = clamped.z;

      this.walkPhase += dt * this.speed * 5.5;
      if (this.placeholder) {
        const { armL, armR, legL, legR, torso, jaw, head } = this.group.userData.parts;
        const swing = Math.sin(this.walkPhase);
        legL.rotation.x = swing * 0.55;
        legR.rotation.x = Math.sin(this.walkPhase + Math.PI) * 0.55;
        armL.rotation.x = -0.7 + Math.sin(this.walkPhase + Math.PI) * 0.85;
        armR.rotation.x = -0.7 + swing * 0.85;
        armL.rotation.z = -0.35 + Math.sin(this.walkPhase * 1.3) * 0.28;
        armR.rotation.z = 0.35 + Math.cos(this.walkPhase * 1.3) * 0.28;
        armL.rotation.y = Math.sin(this.walkPhase * 0.7) * 0.2;
        armR.rotation.y = Math.cos(this.walkPhase * 0.7) * 0.2;
        torso.position.y = 1.05 + Math.abs(swing) * 0.05;
        if (head) head.rotation.z = swing * 0.08;
        if (jaw) jaw.rotation.x = 0.15 + Math.abs(Math.sin(this.walkPhase * 2.2)) * 0.35;
      } else {
        this.group.position.y = Math.abs(Math.sin(this.walkPhase)) * 0.05;
      }
    }

    this.group.rotation.y = Math.atan2(this.dir.x, this.dir.z);

    if (this.attacking && this.placeholder) {
      const lunge = Math.sin(Math.min(this.attackT * 8, Math.PI)) * 0.55;
      this.group.userData.parts.armL.rotation.x = -1.35 - lunge;
      this.group.userData.parts.armR.rotation.x = -1.2 - lunge * 0.85;
      this.group.userData.parts.armL.rotation.z = -0.15;
      this.group.userData.parts.armR.rotation.z = 0.15;
      if (this.group.userData.parts.jaw) this.group.userData.parts.jaw.rotation.x = 0.55;
    }

    return { attacked, damage: this.damage };
  }

  dispose() {
    this.scene.remove(this.group);
    for (const b of this.blood) this.scene.remove(b.mesh);
    this.blood.length = 0;
  }
}
