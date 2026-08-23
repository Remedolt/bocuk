import * as THREE from 'three';
import { WORLD, rand, pick } from './constants.js';

function canvasTexture(size, paint, colorSpace = THREE.SRGBColorSpace) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  paint(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = colorSpace;
  texture.anisotropy = 16;
  return texture;
}

function asphaltTexture() {
  return canvasTexture(512, (ctx, size) => {
    ctx.fillStyle = '#4a4f56';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 14000; i++) {
      const n = 48 + Math.random() * 70;
      ctx.fillStyle = `rgba(${n},${n},${n + 8},${0.14 + Math.random() * 0.4})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 2.4, 1);
    }
    for (let i = 0; i < 28; i++) {
      ctx.strokeStyle = `rgba(22,22,24,${0.16 + Math.random() * 0.28})`;
      ctx.lineWidth = 0.8 + Math.random() * 1.6;
      ctx.beginPath();
      let x = Math.random() * size;
      let y = Math.random() * size;
      ctx.moveTo(x, y);
      for (let k = 0; k < 10; k++) {
        x += (Math.random() - 0.5) * 48;
        y += (Math.random() - 0.5) * 48;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 16; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 16 + Math.random() * 52;
      const g = ctx.createRadialGradient(x, y, 2, x, y, r);
      g.addColorStop(0, 'rgba(14,12,10,0.5)');
      g.addColorStop(1, 'rgba(14,12,10,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.fillStyle = 'rgba(210, 190, 90, 0.05)';
    for (let i = 0; i < 40; i++) ctx.fillRect(Math.random() * size, Math.random() * size, 8, 1);
  });
}

function asphaltBumpTexture() {
  return canvasTexture(512, (ctx, size) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 9000; i++) {
      const n = 90 + Math.random() * 80;
      ctx.fillStyle = `rgb(${n},${n},${n})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    }
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 20; i++) {
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
  }, THREE.NoColorSpace);
}

function brickTexture() {
  return canvasTexture(512, (ctx, size) => {
    ctx.fillStyle = '#6e6460';
    ctx.fillRect(0, 0, size, size);
    const bw = 46;
    const bh = 20;
    for (let y = 0, row = 0; y < size; y += bh, row++) {
      const offset = row % 2 === 0 ? 0 : bw / 2;
      for (let x = -bw; x < size; x += bw) {
        const shade = Math.random();
        const r = 108 + shade * 70 + Math.random() * 18;
        const g = 52 + shade * 28;
        const b = 42 + shade * 18;
        ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
        ctx.fillRect(x + offset + 2, y + 2, bw - 4, bh - 4);
        ctx.fillStyle = 'rgba(255,220,190,0.12)';
        ctx.fillRect(x + offset + 2, y + 2, bw - 4, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x + offset + 2, y + bh - 5, bw - 4, 2);
        if (Math.random() < 0.12) {
          ctx.fillStyle = 'rgba(30,20,16,0.32)';
          ctx.fillRect(x + offset + 8, y + 6, 11, 8);
        }
        if (Math.random() < 0.07) {
          ctx.fillStyle = 'rgba(40,70,28,0.22)';
          ctx.fillRect(x + offset + 4, y + bh - 7, bw - 8, 3);
        }
      }
    }
  });
}

function brickBumpTexture() {
  return canvasTexture(512, (ctx, size) => {
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(0, 0, size, size);
    const bw = 46;
    const bh = 20;
    for (let y = 0, row = 0; y < size; y += bh, row++) {
      const offset = row % 2 === 0 ? 0 : bw / 2;
      for (let x = -bw; x < size; x += bw) {
        const n = 150 + Math.random() * 70;
        ctx.fillStyle = `rgb(${n},${n},${n})`;
        ctx.fillRect(x + offset + 2, y + 2, bw - 4, bh - 4);
      }
    }
  }, THREE.NoColorSpace);
}

function concreteTexture() {
  return canvasTexture(512, (ctx, size) => {
    ctx.fillStyle = '#9aa0a6';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 2800; i++) {
      const n = 120 + Math.random() * 70;
      ctx.fillStyle = `rgba(${n},${n},${n + 6},0.3)`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 3, 2);
    }
    ctx.strokeStyle = 'rgba(70,74,80,0.28)';
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
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = `rgba(90,90,90,${0.15 + Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * size, Math.random() * size);
      ctx.lineTo(Math.random() * size, Math.random() * size);
      ctx.stroke();
    }
  });
}

function grassTexture() {
  return canvasTexture(256, (ctx, size) => {
    ctx.fillStyle = '#3e6230';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 4200; i++) {
      const g = 62 + Math.random() * 90;
      ctx.fillStyle = `rgb(${28 + Math.random() * 36},${g},${22 + Math.random() * 28})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 2, 3 + Math.random() * 4);
    }
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = 'rgba(90, 70, 30, 0.18)';
      ctx.fillRect(Math.random() * size, Math.random() * size, 6, 5);
    }
  });
}

function woodTexture() {
  return canvasTexture(256, (ctx, size) => {
    ctx.fillStyle = '#5a3a22';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 18) {
      ctx.fillStyle = `rgb(${70 + Math.random() * 50},${40 + Math.random() * 22},18)`;
      ctx.fillRect(0, y, size, 16);
      ctx.fillStyle = 'rgba(20,10,0,0.28)';
      ctx.fillRect(0, y + 15, size, 1);
      ctx.strokeStyle = `rgba(30,16,8,${0.12 + Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(0, y + 8);
      for (let x = 0; x < size; x += 16) ctx.lineTo(x, y + 8 + Math.sin(x * 0.08) * 2);
      ctx.stroke();
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

const BUILDING_NAMES = [
  { title: 'GÜL', kind: 'APARTMANI' },
  { title: 'YILDIZ', kind: 'APARTMANI' },
  { title: 'ÇAMLIK', kind: 'SİTESİ' },
  { title: 'BARIŞ', kind: 'APT.' },
  { title: 'DENİZ', kind: 'SİTESİ' },
  { title: 'MEŞE', kind: 'APARTMANI' },
  { title: 'PINAR', kind: 'APT.' },
  { title: 'UMUT', kind: 'SİTESİ' },
  { title: 'ŞAFAK', kind: 'APARTMANI' },
  { title: 'NİLÜFER', kind: 'APT.' },
  { title: 'BAHAR', kind: 'SİTESİ' },
  { title: 'KARANFİL', kind: 'APARTMANI' },
  { title: 'ZAFER', kind: 'APT.' },
  { title: 'ANADOLU', kind: 'SİTESİ' },
  { title: 'KARDELEN', kind: 'APARTMANI' },
  { title: 'LALE', kind: 'APT.' },
];

function plateTexture(title, kind, style = 'wood') {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (style === 'street') {
    ctx.fillStyle = '#123a86';
    ctx.fillRect(0, 0, 768, 256);
    ctx.fillStyle = '#1c56b8';
    ctx.fillRect(22, 22, 724, 212);
    ctx.strokeStyle = '#f4f7fb';
    ctx.lineWidth = 12;
    ctx.strokeRect(14, 14, 740, 228);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillText(title, 384, 108, 680);
    ctx.font = 'bold 42px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillText(kind, 384, 178, 680);
  } else {
    ctx.fillStyle = '#2c1812';
    ctx.fillRect(0, 0, 768, 256);
    ctx.fillStyle = '#3d241c';
    ctx.fillRect(18, 18, 732, 220);
    ctx.strokeStyle = '#d7b56a';
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, 740, 228);
    ctx.strokeStyle = '#8a6230';
    ctx.lineWidth = 3;
    ctx.strokeRect(28, 28, 712, 200);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f4e6c8';
    ctx.font = 'bold 78px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillText(title, 384, 108, 680);
    ctx.fillStyle = '#e2c07a';
    ctx.font = 'bold 40px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillText(kind, 384, 178, 680);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
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
    this._nameIndex = 0;
    this.halfSize = WORLD.halfSize;

    this.asphalt = asphaltTexture();
    this.asphalt.repeat.set(22, 22);
    this.asphaltBump = asphaltBumpTexture();
    this.asphaltBump.repeat.set(22, 22);
    this.brick = brickTexture();
    this.brick.repeat.set(2, 4);
    this.brickBump = brickBumpTexture();
    this.brickBump.repeat.set(2, 4);
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
    this.scene.fog = new THREE.Fog(0xc2d8ea, 52, 158);

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
          vec3 n = normalize(vDir);
          float h = n.y;
          vec3 zenith = vec3(0.20, 0.48, 0.86);
          vec3 mid = vec3(0.52, 0.76, 0.95);
          vec3 horizon = vec3(0.93, 0.90, 0.78);
          vec3 haze = vec3(0.72, 0.78, 0.68);
          vec3 col = mix(haze, horizon, smoothstep(-0.22, 0.02, h));
          col = mix(col, mid, smoothstep(0.02, 0.28, h));
          col = mix(col, zenith, smoothstep(0.28, 0.88, h));
          vec3 sunDir = normalize(vec3(0.42, 0.72, 0.22));
          float mu = max(dot(n, sunDir), 0.0);
          col += vec3(1.0, 0.94, 0.72) * pow(mu, 8.0) * 0.38;
          col += vec3(1.0, 0.96, 0.82) * pow(mu, 220.0) * 1.8;
          float scatter = pow(1.0 - clamp(h, 0.0, 1.0), 2.4);
          col += vec3(1.0, 0.72, 0.42) * scatter * 0.12;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(148, 48, 32), skyMat);
    this.scene.add(sky);

    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(5.2, 20, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff3c4, fog: false, toneMapped: false }),
    );
    sunMesh.position.set(68, 92, 28);
    this.scene.add(sunMesh);

    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xfffdf8,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      fog: false,
    });
    this._clouds = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const puff = new THREE.Group();
      for (let k = 0; k < 4; k++) {
        const cloud = new THREE.Mesh(new THREE.SphereGeometry(rand(5, 9), 10, 8), cloudMat);
        cloud.scale.set(rand(1.3, 2.4), 0.32, rand(1.0, 1.9));
        cloud.position.set(rand(-7, 7), rand(-0.5, 0.5), rand(-4, 4));
        puff.add(cloud);
      }
      puff.position.set(rand(-80, 80), rand(36, 58), rand(-80, 80));
      this._clouds.add(puff);
    }
    this.scene.add(this._clouds);

    const hemi = new THREE.HemisphereLight(0xfff1dc, 0x6a8a52, 1.32);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff1d0, 2.45);
    sun.position.set(42, 78, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0007;
    sun.shadow.normalBias = 0.045;
    sun.shadow.camera.near = 4;
    sun.shadow.camera.far = 130;
    sun.shadow.camera.left = -56;
    sun.shadow.camera.right = 56;
    sun.shadow.camera.top = 56;
    sun.shadow.camera.bottom = -56;
    this.scene.add(sun);
    this.sun = sun;
    this.scene.add(new THREE.AmbientLight(0xfff8ee, 0.48));
    const fill = new THREE.DirectionalLight(0xc8ddff, 0.28);
    fill.position.set(-30, 20, -12);
    this.scene.add(fill);
  }

  _buildGround() {
    const groundMat = new THREE.MeshStandardMaterial({
      map: this.asphalt,
      bumpMap: this.asphaltBump,
      bumpScale: 0.08,
      color: 0x8a9098,
      roughness: 0.92,
      metalness: 0.06,
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
      bumpMap: cloneMap(this.brickBump, Math.max(2, w / 3.4), Math.max(3, h / 2.8)),
      bumpScale: 0.16,
      color: tint,
      roughness: 0.84,
      metalness: 0.05,
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
      color: 0x8ec8e8,
      emissive: 0x3a6a88,
      emissiveIntensity: 0.22,
      roughness: 0.08,
      metalness: 0.72,
      transparent: true,
      opacity: 0.82,
    });
    const darkGlass = new THREE.MeshStandardMaterial({
      color: 0x3a5568,
      roughness: 0.12,
      metalness: 0.62,
      transparent: true,
      opacity: 0.88,
    });

    const towardRoad = x >= 0 ? -1 : 1;
    const doorX = x + towardRoad * (w / 2 + 0.06);
    const doorZ = z;

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
          const streetFacing = (x >= 0 && face.nx < 0) || (x < 0 && face.nx > 0);
          if (streetFacing && r === 0) continue;
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
          if (wy < 2.6 && Math.abs(wx - doorX) < 1.35 && Math.abs(wz - doorZ) < 1.15) continue;
          this.scene.add(frame, pane);
        }
      }
    }

    const doorMat = new THREE.MeshStandardMaterial({
      map: this.wood,
      color: 0x6a4430,
      roughness: 0.72,
    });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.15, 0.1), doorMat);
    door.position.set(doorX, 1.15, doorZ);
    door.rotation.y = Math.PI / 2;
    door.castShadow = true;
    this.scene.add(door);

    const awningCol = pick([0xa31b1b, 0x2a4a7a, 0x2d6a38, 0x7a4a18]);
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.07, 3.4),
      new THREE.MeshStandardMaterial({ color: awningCol, roughness: 0.7 }),
    );
    awning.position.set(x + towardRoad * (w / 2 + 0.52), 2.38, z);
    awning.castShadow = true;
    this.scene.add(awning);

    const shopMat = new THREE.MeshStandardMaterial({
      color: 0x87c4e8,
      roughness: 0.08,
      metalness: 0.74,
      emissive: 0x1a3040,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: 0.7,
    });
    const shopFrameMat = new THREE.MeshStandardMaterial({ color: 0x2c3036, roughness: 0.5, metalness: 0.25 });
    for (const side of [-1, 1]) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.28, 1.05), shopFrameMat);
      const pane = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.08, 0.86), shopMat);
      const px = x + towardRoad * (w / 2 + 0.07);
      const pz = z + side * 1.72;
      frame.position.set(px, 1.02, pz);
      pane.position.set(px + towardRoad * 0.03, 1.02, pz);
      this.scene.add(frame, pane);
    }
    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.9, 10),
      new THREE.MeshStandardMaterial({ color: 0x6a7078, metalness: 0.45, roughness: 0.4 }),
    );
    tank.position.set(x - w * 0.22, h + 0.7, z + d * 0.18);
    tank.castShadow = true;
    this.scene.add(tank);

    this._addBuildingSign(x, z, w, towardRoad);
  }

  _addBuildingSign(x, z, w, towardRoad) {
    const name = BUILDING_NAMES[this._nameIndex % BUILDING_NAMES.length];
    this._nameIndex += 1;
    const tex = plateTexture(name.title, name.kind);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(2.45, 0.82),
      new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.42,
        metalness: 0.12,
        emissiveMap: tex,
        emissive: new THREE.Color(0x333333),
        emissiveIntensity: 0.22,
      }),
    );
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.9, 2.58),
      new THREE.MeshStandardMaterial({ color: 0x3a2218, roughness: 0.55, metalness: 0.18 }),
    );
    const px = x + towardRoad * (w / 2 + 0.12);
    face.position.set(px, 3.62, z);
    back.position.set(x + towardRoad * (w / 2 + 0.08), 3.62, z);
    face.rotation.y = towardRoad * (Math.PI / 2);
    this.scene.add(back, face);
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

    this._addStreetSign(7.12, -15.9, -Math.PI / 2, 'ATATÜRK', 'CADDESİ');
    this._addStreetSign(-7.12, 3.4, Math.PI / 2, 'ATATÜRK', 'CADDESİ');
  }

  _addStreetSign(x, z, rotY, title, kind) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 3.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x2a2e34, metalness: 0.7, roughness: 0.35 }),
    );
    pole.position.set(x, 1.7, z);
    pole.castShadow = true;
    const blade = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 0.55),
      new THREE.MeshStandardMaterial({
        map: plateTexture(title, kind, 'street'),
        roughness: 0.38,
        metalness: 0.12,
        side: THREE.DoubleSide,
      }),
    );
    blade.position.set(x, 3.28, z);
    blade.rotation.y = rotY;
    this.scene.add(pole, blade);
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
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.1, 0.06),
      new THREE.MeshStandardMaterial({
        color: 0xff2a2a,
        emissive: wrecked ? 0x220000 : 0xff2211,
        emissiveIntensity: wrecked ? 0.08 : 0.55,
      }),
    );
    tail.position.set(-0.55, 0.48, -2.18);
    const tailR = tail.clone();
    tailR.position.x = 0.55;
    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(1.72, 0.12, 1.15),
      new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.42, metalness: 0.48 }),
    );
    hood.position.set(0, 0.76, 1.15);
    group.add(lamp, lampR, tail, tailR, hood);

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
      emissiveIntensity: 0.7,
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
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3220, roughness: 0.92 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3a7a34, roughness: 0.86 });
    const leafDark = new THREE.MeshStandardMaterial({ color: 0x2d5e28, roughness: 0.9 });
    const spots = [
      [-7.85, -15.2],
      [-7.85, 2.2],
      [-7.85, 22.4],
      [-7.85, 40.3],
      [7.85, -15.4],
      [7.85, -0.4],
      [7.85, 21.0],
      [7.85, 38.6],
    ];
    for (const [x, z] of spots) {
      const towardRoad = x > 0 ? -1 : 1;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.9, 8), trunkMat);
      trunk.position.set(x, 0.95, z);
      trunk.castShadow = true;
      this.scene.add(trunk);
      const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(0.68, 1), leafMat);
      canopy.position.set(x + towardRoad * 0.18, 2.28, z);
      canopy.scale.set(1.02, 0.88, 1.02);
      canopy.castShadow = true;
      this.scene.add(canopy);
      const canopy2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), leafDark);
      canopy2.position.set(x + towardRoad * 0.42, 2.12, z - 0.12);
      canopy2.castShadow = true;
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
    if (this._clouds) this._clouds.rotation.y += dt * 0.006;
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
