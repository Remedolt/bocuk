import * as THREE from 'three';
import { WORLD, rand, pick } from './constants.js';

function canvasTexture(size, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  paint(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function asphaltTexture() {
  return canvasTexture(512, (ctx, size) => {
    ctx.fillStyle = '#4c5158';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 9000; i++) {
      const n = 55 + Math.random() * 55;
      ctx.fillStyle = `rgba(${n},${n},${n + 6},${0.18 + Math.random() * 0.35})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 2, 1);
    }
    for (let i = 0; i < 18; i++) {
      ctx.strokeStyle = `rgba(28,28,30,${0.18 + Math.random() * 0.25})`;
      ctx.lineWidth = 1 + Math.random();
      ctx.beginPath();
      let x = Math.random() * size;
      let y = Math.random() * size;
      ctx.moveTo(x, y);
      for (let k = 0; k < 8; k++) {
        x += (Math.random() - 0.5) * 40;
        y += (Math.random() - 0.5) * 40;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 18 + Math.random() * 40;
      const g = ctx.createRadialGradient(x, y, 2, x, y, r);
      g.addColorStop(0, 'rgba(18,16,14,0.45)');
      g.addColorStop(1, 'rgba(18,16,14,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
}

function brickTexture() {
  return canvasTexture(512, (ctx, size) => {
    ctx.fillStyle = '#8a7a70';
    ctx.fillRect(0, 0, size, size);
    const bw = 48;
    const bh = 22;
    for (let y = 0, row = 0; y < size; y += bh, row++) {
      const offset = row % 2 === 0 ? 0 : bw / 2;
      for (let x = -bw; x < size; x += bw) {
        const shade = Math.random();
        const r = 118 + shade * 50 + Math.random() * 12;
        const g = 62 + shade * 22;
        const b = 48 + shade * 16;
        ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
        ctx.fillRect(x + offset + 2, y + 2, bw - 4, bh - 4);
        ctx.fillStyle = 'rgba(255,220,190,0.08)';
        ctx.fillRect(x + offset + 2, y + 2, bw - 4, 3);
        if (Math.random() < 0.08) {
          ctx.fillStyle = 'rgba(30,20,16,0.28)';
          ctx.fillRect(x + offset + 8, y + 6, 10, 8);
        }
      }
    }
  });
}

function concreteTexture() {
  return canvasTexture(256, (ctx, size) => {
    ctx.fillStyle = '#9aa0a6';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 1200; i++) {
      const n = 130 + Math.random() * 50;
      ctx.fillStyle = `rgba(${n},${n},${n + 4},0.28)`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 3, 2);
    }
    ctx.strokeStyle = 'rgba(70,74,80,0.22)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i + 1) * (size / 4));
      ctx.lineTo(size, (i + 1) * (size / 4));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((i + 1) * (size / 4), 0);
      ctx.lineTo((i + 1) * (size / 4), size);
      ctx.stroke();
    }
  });
}

function grassTexture() {
  return canvasTexture(256, (ctx, size) => {
    ctx.fillStyle = '#4a6a38';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 2200; i++) {
      const g = 70 + Math.random() * 70;
      ctx.fillStyle = `rgb(${40 + Math.random() * 30},${g},${30 + Math.random() * 20})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 2, 4);
    }
  });
}

function woodTexture() {
  return canvasTexture(128, (ctx, size) => {
    ctx.fillStyle = '#5a3a22';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 16) {
      ctx.fillStyle = `rgb(${80 + Math.random() * 30},${48 + Math.random() * 16},22)`;
      ctx.fillRect(0, y, size, 14);
      ctx.fillStyle = 'rgba(20,10,0,0.25)';
      ctx.fillRect(0, y + 13, size, 1);
    }
  });
}

function fireSpriteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,240,180,1)');
  g.addColorStop(0.35, 'rgba(255,120,20,0.85)');
  g.addColorStop(1, 'rgba(80,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function cloneMap(tex, rx, ry) {
  const map = tex.clone();
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(rx, ry);
  map.needsUpdate = true;
  return map;
}

export class World {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.footprints = [];
    this.staticMeshes = [];
    this.spawnPoints = [];
    this.pickups = [];
    this.fires = [];
    this.explosions = [];
    this.barrels = [];
    this.halfSize = WORLD.halfSize;

    this.asphalt = asphaltTexture();
    this.asphalt.repeat.set(22, 22);
    this.brick = brickTexture();
    this.brick.repeat.set(2, 4);
    this.concrete = concreteTexture();
    this.concrete.repeat.set(4, 4);
    this.grass = grassTexture();
    this.grass.repeat.set(10, 40);
    this.wood = woodTexture();
    this.wood.repeat.set(1, 2);
    this.fireTex = fireSpriteTexture();

    this._tmpBox = new THREE.Box3();
    this._tmpSphere = new THREE.Sphere();

    this._buildAtmosphere();
    this._buildGround();
    this._buildCity();
    this._buildProps();
    this._buildLamps();
    this._buildTrees();
    this._buildFires();
    this._buildSpawns();
  }

  _buildAtmosphere() {
    this.scene.background = new THREE.Color(0x7eb7e4);
    this.scene.fog = new THREE.Fog(0xb9d4ea, 70, 165);

    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
      uniforms: {},
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vDir = normalize(w.xyz);
          gl_Position = projectionMatrix * viewMatrix * w;
        }
      `,
      fragmentShader: `
        varying vec3 vDir;
        void main() {
          float h = vDir.y;
          vec3 zenith = vec3(0.28, 0.56, 0.86);
          vec3 mid = vec3(0.58, 0.78, 0.94);
          vec3 horizon = vec3(0.90, 0.93, 0.86);
          vec3 col = mix(horizon, mid, smoothstep(-0.08, 0.22, h));
          col = mix(col, zenith, smoothstep(0.22, 0.82, h));
          float sun = pow(max(dot(normalize(vDir), normalize(vec3(0.42, 0.78, 0.18))), 0.0), 28.0);
          col += vec3(1.0, 0.92, 0.65) * sun * 0.55;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(148, 24, 16), skyMat);
    this.scene.add(sky);

    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xf4f7fb,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      fog: false,
    });
    for (let i = 0; i < 8; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(rand(6, 11), 8, 6), cloudMat);
      cloud.scale.set(rand(1.6, 2.8), 0.28, rand(1.1, 1.8));
      cloud.position.set(rand(-70, 70), rand(38, 58), rand(-70, 70));
      this.scene.add(cloud);
    }

    const hemi = new THREE.HemisphereLight(0xfff4dc, 0x7ea05a, 1.55);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff3d2, 2.15);
    sun.position.set(42, 78, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 4;
    sun.shadow.camera.far = 120;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0xfff8ee, 0.72));
  }

  _buildGround() {
    const groundMat = new THREE.MeshStandardMaterial({
      map: this.asphalt,
      color: 0x8a9098,
      roughness: 0.94,
      metalness: 0.04,
    });
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(this.halfSize * 2.4, this.halfSize * 2.4),
      groundMat,
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.staticMeshes.push(ground);

    const walkMat = new THREE.MeshStandardMaterial({
      map: this.concrete,
      color: 0xc4c8ce,
      roughness: 0.9,
    });
    for (const x of [-(WORLD.roadHalf + 3.1), WORLD.roadHalf + 3.1]) {
      const walk = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.08, this.halfSize * 2), walkMat);
      walk.position.set(x, 0.04, 0);
      walk.receiveShadow = true;
      this.scene.add(walk);
      this.staticMeshes.push(walk);
    }

    const grassMat = new THREE.MeshStandardMaterial({
      map: this.grass,
      color: 0x6a8a4a,
      roughness: 0.95,
    });
    for (const x of [-(WORLD.roadHalf + 7.4), WORLD.roadHalf + 7.4]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, this.halfSize * 2), grassMat);
      strip.position.set(x, 0.03, 0);
      strip.receiveShadow = true;
      this.scene.add(strip);
    }

    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xd8c45a,
      roughness: 0.55,
    });
    for (let z = -48; z <= 48; z += 6) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 2.4), stripeMat);
      dash.position.set(0, 0.03, z);
      this.scene.add(dash);
    }

    const zebra = new THREE.MeshStandardMaterial({ color: 0xecece8, roughness: 0.7 });
    for (const z of [-12, 18]) {
      for (let x = -6.5; x <= 6.5; x += 1.15) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.025, 3.4), zebra);
        bar.position.set(x, 0.03, z);
        this.scene.add(bar);
      }
    }

    const manholeMat = new THREE.MeshStandardMaterial({ color: 0x3a3c40, metalness: 0.45, roughness: 0.45 });
    for (const [x, z] of [
      [2.4, -6],
      [-3.1, 11],
      [1.6, 33],
      [-2.2, -29],
    ]) {
      const cover = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 16), manholeMat);
      cover.position.set(x, 0.03, z);
      this.scene.add(cover);
    }

    const curbMat = new THREE.MeshStandardMaterial({
      map: this.concrete,
      color: 0xb0b4ba,
      roughness: 0.88,
    });
    for (const x of [-WORLD.roadHalf, WORLD.roadHalf]) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, this.halfSize * 2), curbMat);
      curb.position.set(x, 0.1, 0);
      curb.castShadow = true;
      curb.receiveShadow = true;
      this.scene.add(curb);
      this.staticMeshes.push(curb);
    }
  }

  addBox(x, y, z, w, h, d, material, collide = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.staticMeshes.push(mesh);
    if (collide) {
      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(w, h, d),
        ),
      );
      this.footprints.push({ x, z, w, d });
    }
    return mesh;
  }

  _building(x, z, w, d, h) {
    const tint = pick([0xe4ddd4, 0xd8c8b8, 0xc8d0d8, 0xd4c6ba, 0xcfc4b6]);
    const mat = new THREE.MeshStandardMaterial({
      map: cloneMap(this.brick, Math.max(2, w / 3.4), Math.max(3, h / 2.8)),
      color: tint,
      roughness: 0.86,
      metalness: 0.04,
    });
    this.addBox(x, h / 2, z, w, h, d, mat, true);

    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a6068, roughness: 0.7, metalness: 0.2 });
    this.addBox(x, h + 0.12, z, w + 0.55, 0.28, d + 0.55, roofMat, false);

    const trimMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c8, roughness: 0.55 });
    this.addBox(x, h - 0.18, z, w + 0.28, 0.22, d + 0.28, trimMat, false);

    const plinthMat = new THREE.MeshStandardMaterial({
      map: cloneMap(this.concrete, 2, 1),
      color: 0x8a8e94,
      roughness: 0.9,
    });
    this.addBox(x, 0.28, z, w + 0.18, 0.56, d + 0.18, plinthMat, false);

    const ledgeMat = new THREE.MeshStandardMaterial({ color: 0xcfc8be, roughness: 0.62 });
    this.addBox(x, 3.15, z, w + 0.2, 0.12, d + 0.2, ledgeMat, false);

    const acMat = new THREE.MeshStandardMaterial({ color: 0x8a9098, metalness: 0.5, roughness: 0.4 });
    this.addBox(x + w * 0.18, h + 0.42, z - d * 0.12, 1.4, 0.55, 1.1, acMat, false);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2c3036, roughness: 0.5, metalness: 0.25 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x7eb6d8,
      emissive: 0x3a6a88,
      emissiveIntensity: 0.12,
      roughness: 0.12,
      metalness: 0.62,
    });
    const darkGlass = new THREE.MeshStandardMaterial({
      color: 0x4a6578,
      roughness: 0.18,
      metalness: 0.5,
    });

    const faces = [
      { nx: 1, nz: 0, px: x + w / 2 + 0.05, pz: z },
      { nx: -1, nz: 0, px: x - w / 2 - 0.05, pz: z },
      { nx: 0, nz: 1, px: x, pz: z + d / 2 + 0.05 },
      { nx: 0, nz: -1, px: x, pz: z - d / 2 - 0.05 },
    ];

    for (const face of faces) {
      const along = face.nx !== 0 ? d : w;
      const cols = Math.max(2, Math.floor(along / 3.1));
      const rows = Math.max(2, Math.floor(h / 3.4));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() < 0.16) continue;
          const lit = Math.random() < 0.22;
          const t = (c + 0.5) / cols - 0.5;
          const wy = 1.7 + r * 3.15;
          let wx;
          let wz;
          let rotY = 0;
          if (face.nx !== 0) {
            wx = face.px;
            wz = z + t * d * 0.78;
            rotY = face.nx > 0 ? Math.PI / 2 : -Math.PI / 2;
          } else {
            wx = x + t * w * 0.78;
            wz = face.pz;
            rotY = face.nz > 0 ? 0 : Math.PI;
          }
          const frame = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.32, 0.08), frameMat);
          const pane = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.05, 0.04), lit ? glassMat : darkGlass);
          frame.position.set(wx, wy, wz);
          pane.position.set(wx, wy, wz);
          frame.rotation.y = rotY;
          pane.rotation.y = rotY;
          if (face.nx !== 0) pane.position.x += face.nx * 0.04;
          else pane.position.z += face.nz * 0.04;
          this.scene.add(frame, pane);
        }
      }
    }

    const doorMat = new THREE.MeshStandardMaterial({
      map: this.wood,
      color: 0x6a4430,
      roughness: 0.72,
    });
    const towardRoad = x >= 0 ? -1 : 1;
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.15, 0.1), doorMat);
    door.position.set(x + towardRoad * (w / 2 + 0.06), 1.15, z);
    door.rotation.y = Math.PI / 2;
    door.castShadow = true;
    this.scene.add(door);
  }

  _buildCity() {
    const east = [
      [14, -42, 10, 14, 16],
      [16, -24, 12, 12, 22],
      [15, -8, 11, 10, 14],
      [17, 10, 13, 16, 26],
      [14, 30, 10, 12, 18],
      [18, 46, 14, 10, 12],
    ];
    const west = [
      [-15, -44, 11, 12, 18],
      [-17, -26, 13, 14, 24],
      [-14, -6, 10, 10, 13],
      [-16, 12, 12, 14, 20],
      [-15, 32, 11, 12, 16],
      [-18, 48, 14, 10, 11],
    ];
    for (const b of [...east, ...west]) this._building(...b);

    this._building(-38, -18, 12, 16, 15);
    this._building(38, 18, 12, 14, 17);
    this._building(-40, 22, 10, 12, 12);
    this._building(40, -28, 11, 12, 14);

    const wallMat = new THREE.MeshStandardMaterial({
      map: this.concrete,
      color: 0x6a7078,
      roughness: 0.95,
    });
    this.addBox(0, 1.1, -this.halfSize - 1, 40, 2.2, 1.2, wallMat, true);
    this.addBox(0, 1.1, this.halfSize + 1, 40, 2.2, 1.2, wallMat, true);
  }

  _makeCar(x, z, rotY, wrecked) {
    const group = new THREE.Group();
    const bodyCol = wrecked ? 0x4a5048 : pick([0x2a3a52, 0x5a2a22, 0x2a4a28, 0x3a3a48, 0x6a5a2a]);
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.55, 4.4),
      new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.48, metalness: 0.42 }),
    );
    body.position.y = 0.45;
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.5, 2.1),
      new THREE.MeshStandardMaterial({
        color: 0x8ec4e0,
        roughness: 0.15,
        metalness: 0.55,
        transparent: true,
        opacity: 0.72,
      }),
    );
    cabin.position.set(0, 0.95, -0.2);
    const bumper = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.18, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x222428, metalness: 0.6, roughness: 0.4 }),
    );
    bumper.position.set(0, 0.32, 2.2);
    group.add(body, cabin, bumper);

    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    for (const [wx, wz] of [
      [-0.85, 1.35],
      [0.85, 1.35],
      [-0.85, -1.35],
      [0.85, -1.35],
    ]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.28, 10), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.32, wz);
      group.add(wheel);
    }

    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.12, 0.08),
      new THREE.MeshStandardMaterial({
        color: wrecked ? 0x886644 : 0xfff0c0,
        emissive: wrecked ? 0x221100 : 0xffcc66,
        emissiveIntensity: wrecked ? 0.1 : 0.7,
      }),
    );
    lamp.position.set(-0.55, 0.5, 2.18);
    const lampR = lamp.clone();
    lampR.position.x = 0.55;
    group.add(lamp, lampR);

    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    group.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        this.staticMeshes.push(c);
      }
    });
    this.scene.add(group);
    group.updateMatrixWorld(true);
    this.colliders.push(new THREE.Box3().setFromObject(group));
    this.footprints.push({ x, z, w: 2.4, d: 4.8 });
  }

  _buildProps() {
    const crateMat = new THREE.MeshStandardMaterial({
      map: this.wood,
      color: 0x8a6238,
      roughness: 0.86,
    });
    const dumpMat = new THREE.MeshStandardMaterial({ color: 0x2f5a32, roughness: 0.55, metalness: 0.4 });
    const rubbleMat = new THREE.MeshStandardMaterial({ color: 0x6a6864, roughness: 0.95 });

    this._makeCar(-4.6, -16, 0.15, true);
    this._makeCar(5.2, 22, Math.PI + 0.4, false);
    this._makeCar(-5.4, 38, 0.05, true);
    this._makeCar(4.8, -36, Math.PI - 0.2, false);

    const crates = [
      [6.6, 0.35, 4],
      [7.2, 0.35, 5.1],
      [-7.1, 0.35, -11],
      [6.8, 0.35, 41],
      [-6.9, 0.35, 18],
    ];
    for (const [x, y, z] of crates) this.addBox(x, y, z, 0.8, 0.7, 0.8, crateMat, true);

    this.addBox(-7.4, 0.7, -22, 1.4, 1.4, 2.4, dumpMat, true);
    this.addBox(7.5, 0.7, 8, 1.4, 1.4, 2.4, dumpMat, true);

    for (let i = 0; i < 14; i++) {
      const x = rand(-7.2, 7.2);
      const z = rand(-50, 50);
      if (Math.hypot(x, z) < 6) continue;
      const s = rand(0.35, 1.1);
      this.addBox(x, s * 0.28, z, s, s * 0.55, s * 0.8, rubbleMat, false);
    }

    const barMat = new THREE.MeshStandardMaterial({ color: 0x4a3828, roughness: 0.8 });
    this.addBox(-3.2, 0.55, 1.5, 2.8, 1.1, 0.35, barMat, true);
    this.addBox(2.8, 0.55, -8.5, 0.35, 1.1, 3.2, barMat, true);

    const benchMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.75 });
    for (const [x, z, rot] of [
      [-9.2, -7, 0],
      [9.2, 9, 0],
      [-9.2, 26, 0],
    ]) {
      const seat = this.addBox(x, 0.42, z, 1.6, 0.12, 0.48, benchMat, false);
      seat.rotation.y = rot;
      this.addBox(x, 0.22, z - 0.18, 1.5, 0.4, 0.1, benchMat, false);
    }
  }

  _buildLamps() {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a2e34, metalness: 0.72, roughness: 0.32 });
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xf2ead2,
      emissive: 0xc8b888,
      emissiveIntensity: 0.35,
      roughness: 0.35,
      metalness: 0.3,
    });

    const spots = [];
    for (let z = -48; z <= 48; z += 16) {
      spots.push([-WORLD.roadHalf - 0.8, z], [WORLD.roadHalf + 0.8, z]);
    }

    for (const [x, z] of spots) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5.2, 8), poleMat);
      pole.position.set(x, 2.6, z);
      pole.castShadow = true;
      this.scene.add(pole);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.08), poleMat);
      arm.position.set(x + (x > 0 ? -0.7 : 0.7), 5.15, z);
      this.scene.add(arm);

      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.45), lampMat);
      const lx = x + (x > 0 ? -1.4 : 1.4);
      lamp.position.set(lx, 5.0, z);
      this.scene.add(lamp);
    }
  }

  _buildTrees() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3220, roughness: 0.9 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x3f7a38 });
    const spots = [
      [-10.2, -18],
      [-10.4, 4],
      [-10.1, 34],
      [10.3, -30],
      [10.2, -2],
      [10.4, 16],
      [10.1, 44],
      [-10.3, -40],
    ];
    for (const [x, z] of spots) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 2.1, 7), trunkMat);
      trunk.position.set(x, 1.05, z);
      trunk.castShadow = true;
      this.scene.add(trunk);
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.15, 8, 6), leafMat);
      canopy.position.set(x, 2.55, z);
      canopy.scale.set(1.15, 0.85, 1.1);
      canopy.castShadow = true;
      this.scene.add(canopy);
      const canopy2 = new THREE.Mesh(new THREE.SphereGeometry(0.75, 7, 5), leafMat);
      canopy2.position.set(x + 0.45, 2.35, z - 0.2);
      this.scene.add(canopy2);
    }
  }

  _buildFires() {
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x6a2414, metalness: 0.45, roughness: 0.5 });
    const sites = [
      [-6.4, -4],
      [6.1, 14],
      [-5.8, 28],
      [5.5, -28],
      [6.4, -12],
      [-6.2, 8],
    ];
    for (const [x, z] of sites) {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.9, 10), barrelMat);
      barrel.position.set(x, 0.45, z);
      barrel.castShadow = true;
      this.scene.add(barrel);
      this.staticMeshes.push(barrel);

      const collider = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, 0.45, z),
        new THREE.Vector3(0.9, 0.95, 0.9),
      );
      this.colliders.push(collider);

      const light = new THREE.PointLight(0xff6a22, 0.55, 8, 2);
      light.position.set(x, 1.3, z);
      this.scene.add(light);

      const sprites = [];
      for (let i = 0; i < 4; i++) {
        const mat = new THREE.SpriteMaterial({
          map: this.fireTex,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
        });
        const spr = new THREE.Sprite(mat);
        spr.position.set(x, 1.05 + i * 0.18, z);
        spr.scale.set(0.7, 0.9, 1);
        this.scene.add(spr);
        sprites.push({ spr, ox: x, oz: z, oy: 1.05 + i * 0.18 });
      }
      const entry = {
        mesh: barrel,
        light,
        sprites,
        collider,
        x,
        z,
        exploded: false,
        phase: Math.random() * Math.PI * 2,
      };
      barrel.userData.kind = 'barrel';
      barrel.userData.barrel = entry;
      this.fires.push(entry);
      this.barrels.push(entry);
    }
  }

  explodeBarrel(entry) {
    if (!entry || entry.exploded) return null;
    entry.exploded = true;
    this.scene.remove(entry.mesh, entry.light);
    for (const s of entry.sprites) this.scene.remove(s.spr);
    this.staticMeshes = this.staticMeshes.filter((m) => m !== entry.mesh);
    this.colliders = this.colliders.filter((c) => c !== entry.collider);

    const origin = new THREE.Vector3(entry.x, 0.6, entry.z);
    const flash = new THREE.PointLight(0xffaa33, 8, 14, 2);
    flash.position.copy(origin);
    this.scene.add(flash);
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xffcc66, transparent: true, opacity: 0.9 }),
    );
    ball.position.copy(origin);
    this.scene.add(ball);
    const bits = [];
    for (let i = 0; i < 14; i++) {
      const bit = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x5a2414, metalness: 0.4, roughness: 0.6 }),
      );
      bit.position.copy(origin);
      const vel = new THREE.Vector3((Math.random() - 0.5) * 7, 2 + Math.random() * 5, (Math.random() - 0.5) * 7);
      this.scene.add(bit);
      bits.push({ mesh: bit, vel });
    }
    this.explosions.push({ flash, ball, bits, life: 0.55 });
    this.fires = this.fires.filter((f) => f !== entry);
    return { position: origin, radius: 6.4, damage: 90, playerDamage: 28 };
  }

  _buildSpawns() {
    this.spawnPoints = [];
    for (const x of [-5.2, -2.4, 0, 2.4, 5.2]) {
      this.spawnPoints.push(new THREE.Vector3(x, 0, -52));
      this.spawnPoints.push(new THREE.Vector3(x, 0, 52));
    }
    for (const z of [-5, 0, 5]) {
      this.spawnPoints.push(new THREE.Vector3(-50, 0, z));
      this.spawnPoints.push(new THREE.Vector3(50, 0, z));
    }
  }

  intersectsRadius(x, z, radius, y = 0.9) {
    this._tmpSphere.center.set(x, y, z);
    this._tmpSphere.radius = radius;
    for (const box of this.colliders) {
      if (box.intersectsSphere(this._tmpSphere)) return true;
    }
    return false;
  }

  findOpen(x, z, radius) {
    const c = this.clampInside(x, z);
    if (!this.intersectsRadius(c.x, c.z, radius, 0.9)) return c;
    return this.pushOut(c.x, c.z, radius);
  }

  pushOut(x, z, radius) {
    if (!this.intersectsRadius(x, z, radius, 0.9)) return { x, z };
    const dirs = [
      { x: x === 0 ? 1 : -Math.sign(x), z: 0 },
      { x: 0, z: z === 0 ? 1 : -Math.sign(z) },
      { x: 1, z: 0 },
      { x: -1, z: 0 },
      { x: 0, z: 1 },
      { x: 0, z: -1 },
      { x: 0.7, z: 0.7 },
      { x: -0.7, z: 0.7 },
      { x: 0.7, z: -0.7 },
      { x: -0.7, z: -0.7 },
    ];
    for (let dist = 0.35; dist <= 22; dist += 0.35) {
      for (const d of dirs) {
        const nx = x + d.x * dist;
        const nz = z + d.z * dist;
        const c = this.clampInside(nx, nz);
        if (!this.intersectsRadius(c.x, c.z, radius, 0.9)) return c;
      }
    }
    const road = this.clampInside(0, z);
    if (!this.intersectsRadius(road.x, road.z, radius, 0.9)) return road;
    return { x: 0, z: THREE.MathUtils.clamp(z, -50, 50) };
  }

  blockedAhead(origin, direction, dist) {
    const steps = 4;
    for (let i = 1; i <= steps; i++) {
      const t = (i / steps) * dist;
      const x = origin.x + direction.x * t;
      const z = origin.z + direction.z * t;
      if (this.intersectsRadius(x, z, 0.38, 0.9)) return true;
    }
    return false;
  }

  clampInside(x, z) {
    const m = this.halfSize - 1.2;
    return {
      x: THREE.MathUtils.clamp(x, -m, m),
      z: THREE.MathUtils.clamp(z, -m, m),
    };
  }

  spawnPickup(position) {
    const group = new THREE.Group();
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.28, 0.45),
      new THREE.MeshStandardMaterial({
        color: 0x1f8a44,
        emissive: 0x22cc55,
        emissiveIntensity: 0.9,
      }),
    );
    const cross = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.32),
      new THREE.MeshBasicMaterial({ color: 0xe8ffe8 }),
    );
    const cross2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.08, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xe8ffe8 }),
    );
    glow.position.y = 0.4;
    cross.position.y = 0.56;
    cross2.position.y = 0.56;
    group.add(glow, cross, cross2);
    group.position.copy(position);
    group.position.y = 0;
    this.scene.add(group);

    const light = new THREE.PointLight(0x33ff77, 0.8, 6, 2);
    light.position.set(position.x, 0.8, position.z);
    this.scene.add(light);

    const pickup = { group, light, taken: false, bob: Math.random() * Math.PI * 2 };
    this.pickups.push(pickup);
    return pickup;
  }

  clearPickups() {
    for (const p of this.pickups) {
      this.scene.remove(p.group, p.light);
    }
    this.pickups.length = 0;
  }

  update(dt, elapsed) {
    for (const fire of this.fires) {
      if (fire.exploded) continue;
      fire.phase += dt * 9;
      fire.light.intensity = 0.45 + Math.sin(fire.phase) * 0.12 + Math.random() * 0.05;
      for (let i = 0; i < fire.sprites.length; i++) {
        const s = fire.sprites[i];
        const wobble = Math.sin(elapsed * 8 + i) * 0.08;
        s.spr.position.set(
          s.ox + Math.sin(elapsed * 10 + i) * 0.04,
          s.oy + Math.abs(Math.sin(elapsed * 7 + i)) * 0.08,
          s.oz + Math.cos(elapsed * 9 + i) * 0.04,
        );
        s.spr.material.opacity = 0.55 + Math.sin(fire.phase + i) * 0.25;
        s.spr.scale.setScalar(0.55 + (i + 1) * 0.12 + wobble);
      }
    }
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const ex = this.explosions[i];
      ex.life -= dt;
      ex.ball.scale.addScalar(dt * 8);
      ex.ball.material.opacity = Math.max(0, ex.life * 1.6);
      ex.flash.intensity = Math.max(0, ex.life * 14);
      for (const b of ex.bits) {
        b.vel.y -= 18 * dt;
        b.mesh.position.addScaledVector(b.vel, dt);
        b.mesh.rotation.x += dt * 8;
      }
      if (ex.life <= 0) {
        this.scene.remove(ex.flash, ex.ball);
        for (const b of ex.bits) this.scene.remove(b.mesh);
        this.explosions.splice(i, 1);
      }
    }
    for (const p of this.pickups) {
      if (p.taken) continue;
      p.bob += dt * 2.4;
      p.group.position.y = 0.08 + Math.sin(p.bob) * 0.08;
      p.group.rotation.y += dt * 1.4;
    }
  }
}
