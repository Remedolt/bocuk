import { WEAPON } from './constants.js';

export class UI {
  constructor() {
    this.hud = document.getElementById('hud');
    this.waveNumber = document.getElementById('wave-number');
    this.zombiesLeft = document.getElementById('zombies-left');
    this.xpValue = document.getElementById('xp-value');
    this.healthText = document.getElementById('health-text');
    this.healthFill = document.getElementById('health-fill');
    this.healthWrap = document.getElementById('health-wrap');
    this.medkitCount = document.getElementById('medkit-count');
    this.ammoMag = document.getElementById('ammo-mag');
    this.ammoReserve = document.getElementById('ammo-reserve');
    this.ammoPips = document.getElementById('ammo-pips');
    this.reloadBar = document.getElementById('reload-bar');
    this.reloadFill = document.getElementById('reload-fill');
    this.crosshair = document.getElementById('crosshair');
    this.hitmarker = document.getElementById('hitmarker');
    this.hitFeed = document.getElementById('hit-feed');
    this.waveBanner = document.getElementById('wave-banner');
    this.bannerTitle = document.getElementById('banner-title');
    this.bannerSub = document.getElementById('banner-sub');
    this.hurt = document.getElementById('hurt');
    this.blood = document.getElementById('blood-splatter');
    this.pause = document.getElementById('overlay-pause');
    this.start = document.getElementById('overlay-start');
    this.gameover = document.getElementById('overlay-gameover');
    this.goWave = document.getElementById('go-wave');
    this.goXp = document.getElementById('go-xp');
    this.goKills = document.getElementById('go-kills');
    this.pickupToast = document.getElementById('pickup-toast');
    this.minimap = document.getElementById('minimap');
    this.miniCtx = this.minimap.getContext('2d');

    this._hitTimer = 0;
    this._bannerTimer = 0;
    this._bloodTimer = 0;
    this._pipCount = -1;
  }

  showHud(visible) {
    this.hud.classList.toggle('hidden', !visible);
  }

  hideStart() {
    this.start.classList.add('hidden');
  }

  showBanner(title, sub, duration = 2.4) {
    this.bannerTitle.textContent = title;
    this.bannerSub.textContent = sub;
    this.waveBanner.classList.remove('hidden');
    this._bannerTimer = duration;
  }

  showHit(headshot, xp) {
    this.hitmarker.classList.remove('hidden');
    this.hitmarker.classList.toggle('head', headshot);
    this.crosshair.classList.add('hit');
    this._hitTimer = 0.16;

    const line = document.createElement('div');
    line.className = `line${headshot ? '' : ' body'}`;
    line.textContent = headshot ? `KAFA VURUŞU! +${xp} PUAN` : `İSABET +${xp} PUAN`;
    this.hitFeed.appendChild(line);
    setTimeout(() => line.remove(), 900);

    if (headshot) {
      this.blood.style.opacity = '1';
      this._bloodTimer = 0.28;
    }
  }

  toast(text) {
    this.pickupToast.textContent = text;
    this.pickupToast.classList.remove('show');
    void this.pickupToast.offsetWidth;
    this.pickupToast.classList.add('show');
  }

  setPauseHint(_show) {
    /* pause overlay is used instead */
  }

  showPause(show) {
    this.pause.classList.toggle('hidden', !show);
  }

  showStart() {
    this.start.classList.remove('hidden');
  }

  showGameOver({ wave, xp, kills }) {
    this.goWave.textContent = String(wave);
    this.goXp.textContent = String(xp);
    this.goKills.textContent = String(kills);
    this.gameover.classList.remove('hidden');
    this.showHud(false);
  }

  hideGameOver() {
    this.gameover.classList.add('hidden');
  }

  setTarget(_zombie) {
    /* hedef kilit ve düşman canı gösterilmez */
  }

  update(dt, { player, weapon, waves, xp }) {
    this._hitTimer -= dt;
    this._bannerTimer -= dt;
    this._bloodTimer -= dt;
    if (this._hitTimer <= 0) {
      this.hitmarker.classList.add('hidden');
      this.crosshair.classList.remove('hit');
    }
    if (this._bannerTimer <= 0) this.waveBanner.classList.add('hidden');
    if (this._bloodTimer <= 0) this.blood.style.opacity = '0';

    this.hurt.style.opacity = String(player.hurtFlash * 0.95);
    this.waveNumber.textContent = String(waves.wave || 1);
    this.zombiesLeft.textContent = String(waves.remaining);
    this.xpValue.textContent = String(xp);

    const hpPct = Math.max(0, Math.round(player.health));
    this.healthText.textContent = `${hpPct}%`;
    this.healthFill.style.width = `${hpPct}%`;
    this.healthWrap.classList.toggle('low', hpPct <= 30);
    this.medkitCount.textContent = String(player.medkits);

    this.ammoMag.textContent = String(weapon.mag);
    this.ammoReserve.textContent = `/ ${weapon.reserve}`;

    if (this._pipCount !== weapon.mag) {
      this._pipCount = weapon.mag;
      this.ammoPips.innerHTML = '';
      const shown = Math.min(10, 30);
      for (let i = 0; i < shown; i++) {
        const pip = document.createElement('span');
        const filled = i < Math.ceil((weapon.mag / 30) * shown);
        if (!filled) pip.className = 'empty';
        this.ammoPips.appendChild(pip);
      }
    }

    if (weapon.reloading) {
      this.reloadBar.classList.remove('hidden');
      this.reloadFill.style.width = `${(weapon.reloadT / WEAPON.reloadTime) * 100}%`;
    } else {
      this.reloadBar.classList.add('hidden');
    }
  }

  drawMinimap(player, waves, world) {
    const ctx = this.miniCtx;
    const w = this.minimap.width;
    const h = this.minimap.height;
    const scale = 2.15;
    const yaw = player.yaw;

    ctx.fillStyle = '#07090d';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(yaw);
    ctx.translate(-player.position.x * scale, -player.position.z * scale);

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    const hs = world.halfSize;
    ctx.strokeRect(-hs * scale, -hs * scale, hs * 2 * scale, hs * 2 * scale);

    ctx.fillStyle = 'rgba(90, 100, 110, 0.55)';
    for (const f of world.footprints) {
      ctx.fillRect(
        (f.x - f.w / 2) * scale,
        (f.z - f.d / 2) * scale,
        f.w * scale,
        f.d * scale,
      );
    }

    ctx.fillStyle = '#ff2a2a';
    for (const z of waves.zombies) {
      if (!z.alive) continue;
      ctx.beginPath();
      ctx.arc(z.position.x * scale, z.position.z * scale, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#5dff8a';
    for (const p of world.pickups) {
      if (p.taken) continue;
      ctx.fillRect(p.group.position.x * scale - 2, p.group.position.z * scale - 2, 4, 4);
    }

    ctx.restore();

    ctx.fillStyle = '#ffd23c';
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2 - 7);
    ctx.lineTo(w / 2 + 5, h / 2 + 6);
    ctx.lineTo(w / 2 - 5, h / 2 + 6);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 42, 42, 0.35)';
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  }
}
