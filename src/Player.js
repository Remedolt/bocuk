import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { PLAYER } from './constants.js';

export class Player {
  constructor(camera, domElement, world, sound) {
    this.camera = camera;
    this.world = world;
    this.sound = sound;
    this.rig = new THREE.Object3D();
    this.rig.add(camera);
    this.flashlight = new THREE.PointLight(0xfff4e0, 0.22, 10, 1.8);
    this.flashlight.position.set(0.15, -0.1, 0.2);
    camera.add(this.flashlight);
    this.controls = new PointerLockControls(camera, document.body);
    this.object = this.rig;

    this.velocity = new THREE.Vector3();
    this.wish = new THREE.Vector3();
    this.forward = new THREE.Vector3();
    this.right = new THREE.Vector3();

    this.keys = new Set();
    this.maxHealth = PLAYER.maxHealth;
    this.health = PLAYER.maxHealth;
    this.medkits = 1;
    this.alive = true;
    this.onGround = true;
    this.hurtTimer = 0;
    this.hurtFlash = 0;
    this.bob = 0;
    this.sprinting = false;
    this.kills = 0;
    this.jumpHeld = false;

    this._onKeyDown = (e) => {
      this.keys.add(e.code);
      if (e.code === 'KeyH') this.useMedkit();
    };
    this._onKeyUp = (e) => this.keys.delete(e.code);

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
  }

  get position() {
    return this.object.position;
  }

  get yaw() {
    const euler = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
    return euler.y;
  }

  lookDirection(target) {
    this.camera.getWorldDirection(target);
    return target;
  }

  lock() {
    this.controls.lock();
  }

  unlock() {
    this.controls.unlock();
  }

  reset() {
    this.health = this.maxHealth;
    this.medkits = 1;
    this.alive = true;
    this.velocity.set(0, 0, 0);
    this.hurtTimer = 0;
    this.hurtFlash = 0;
    this.kills = 0;
    this.object.position.set(0, PLAYER.height, 8);
    this.camera.position.set(0, 0, 0);
    this.camera.quaternion.identity();
    this.camera.rotation.set(0, 0, 0);
  }

  takeDamage(amount) {
    if (!this.alive || this.hurtTimer > 0) return false;
    this.health = Math.max(0, this.health - amount);
    this.hurtTimer = PLAYER.hurtInvuln;
    this.hurtFlash = 1;
    this.sound.hurt();
    this.velocity.y = Math.max(this.velocity.y, 1.4);
    if (this.health <= 0) {
      this.alive = false;
      this.sound.die();
      return true;
    }
    return false;
  }

  useMedkit() {
    if (!this.alive || this.medkits <= 0 || this.health >= this.maxHealth) return false;
    this.medkits -= 1;
    this.health = Math.min(this.maxHealth, this.health + PLAYER.medkitHeal);
    this.sound.medkit();
    return true;
  }

  addMedkit() {
    this.medkits += 1;
    this.sound.pickup();
  }

  update(dt) {
    if (!this.alive) {
      this.hurtFlash = Math.max(this.hurtFlash, 0.55);
      return;
    }

    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 1.6);

    const locked = this.controls.isLocked;
    const forward = Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS'));
    const strafe = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'));
    this.sprinting = locked && (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'));
    const speed = this.sprinting ? PLAYER.sprintSpeed : PLAYER.walkSpeed;

    this.wish.set(0, 0, 0);
    if (locked && (forward || strafe)) {
      this.camera.getWorldDirection(this.forward);
      this.forward.y = 0;
      if (this.forward.lengthSq() < 0.0001) this.forward.set(0, 0, -1);
      this.forward.normalize();
      this.right.crossVectors(this.forward, this.rig.up).normalize();
      this.wish.addScaledVector(this.forward, forward);
      this.wish.addScaledVector(this.right, strafe);
      if (this.wish.lengthSq() > 0) this.wish.normalize();
    }

    const accel = this.onGround ? 18 : 4;
    this.velocity.x += (this.wish.x * speed - this.velocity.x) * Math.min(1, accel * dt);
    this.velocity.z += (this.wish.z * speed - this.velocity.z) * Math.min(1, accel * dt);

    if (this.onGround && locked && this.keys.has('Space') && !this.jumpHeld) {
      this.velocity.y = PLAYER.jumpSpeed;
      this.onGround = false;
      this.jumpHeld = true;
    }
    if (!this.keys.has('Space')) this.jumpHeld = false;

    this.velocity.y -= PLAYER.gravity * dt;

    const dx = this.velocity.x * dt;
    const dz = this.velocity.z * dt;
    const pos = this.object.position;

    pos.x += dx;
    if (this.world.intersectsRadius(pos.x, pos.z, PLAYER.radius, 0.9)) {
      pos.x -= dx;
      this.velocity.x = 0;
    }

    pos.z += dz;
    if (this.world.intersectsRadius(pos.x, pos.z, PLAYER.radius, 0.9)) {
      pos.z -= dz;
      this.velocity.z = 0;
    }

    pos.y += this.velocity.y * dt;
    if (pos.y <= PLAYER.height) {
      pos.y = PLAYER.height;
      this.velocity.y = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    const clamped = this.world.clampInside(pos.x, pos.z);
    pos.x = clamped.x;
    pos.z = clamped.z;

    const moving = this.onGround && this.wish.lengthSq() > 0.1;
    if (moving) {
      this.bob += dt * (this.sprinting ? 14 : 10);
      const bobAmt = this.sprinting ? 0.045 : 0.028;
      this.camera.position.y = Math.sin(this.bob) * bobAmt;
    } else {
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 0, 8 * dt);
    }
  }

  dispose() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
  }
}
