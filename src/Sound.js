/**
 * Procedural SFX via Web Audio — no external files required.
 * Positional groans use a PannerNode relative to the listener (player).
 */
export class Sound {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this._noise = null;
    this._musicOn = false;
    this._musicBus = null;
    this._musicNodes = [];
    this._musicTimer = 0;
    this._musicStep = 0;
  }

  resume() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.38;
      this.master.connect(this.ctx.destination);
      this._noise = this._makeNoise(1.2);
    }
    if (this.ctx.state === 'suspended') {
      return this.ctx.resume();
    }
    return Promise.resolve();
  }

  setListener(x, y, z, forwardX, forwardZ) {
    if (!this.ctx) return;
    const listener = this.ctx.listener;
    if (listener.positionX) {
      listener.positionX.value = x;
      listener.positionY.value = y;
      listener.positionZ.value = z;
      listener.forwardX.value = forwardX;
      listener.forwardY.value = 0;
      listener.forwardZ.value = forwardZ;
      listener.upX.value = 0;
      listener.upY.value = 1;
      listener.upZ.value = 0;
    }
  }

  _out(node, when, duration, gain = 1) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, when);
    node.connect(g);
    g.connect(this.master);
    node.start(when);
    node.stop(when + duration);
    return g;
  }

  _osc(type, freq, when, duration, peak = 0.2, decay = 0.04) {
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    const g = this._out(osc, when, duration, 0.0001);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), when + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    return osc;
  }

  _makeNoise(seconds) {
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * seconds, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  _burstNoise(when, duration, peak, filterFreq, q = 1.2) {
    const src = this.ctx.createBufferSource();
    src.buffer = this._noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(when);
    src.stop(when + duration + 0.02);
  }

  fire() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._burstNoise(t, 0.09, 0.55, 1400, 0.7);
    this._osc('square', 140, t, 0.12, 0.12, 0.09);
    this._osc('sawtooth', 70, t, 0.16, 0.18, 0.12);
    this._osc('triangle', 980, t + 0.01, 0.04, 0.05, 0.03);
  }

  casing() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime + 0.07;
    this._burstNoise(t, 0.05, 0.08, 4200, 2.4);
    this._osc('square', 1800, t, 0.05, 0.03, 0.04);
  }

  empty() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._osc('square', 90, t, 0.08, 0.08, 0.06);
    this._burstNoise(t, 0.04, 0.12, 2400, 1.4);
  }

  reload() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._burstNoise(t, 0.08, 0.12, 900, 1);
    this._osc('triangle', 220, t, 0.1, 0.05, 0.08);
    this._burstNoise(t + 0.55, 0.06, 0.1, 1600, 1.6);
    this._osc('square', 140, t + 1.55, 0.1, 0.08, 0.08);
    this._burstNoise(t + 1.55, 0.08, 0.16, 700, 0.8);
  }

  hurt() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._osc('sawtooth', 90, t, 0.28, 0.16, 0.22);
    this._burstNoise(t, 0.2, 0.22, 400, 0.6);
  }

  die() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.1);
    const g = this._out(osc, t, 1.2, 0.0001);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
    this._burstNoise(t, 0.4, 0.2, 200, 0.4);
  }

  hit(headshot) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    if (headshot) {
      this._osc('square', 880, t, 0.08, 0.07, 0.06);
      this._osc('triangle', 1320, t + 0.02, 0.08, 0.05, 0.06);
    } else {
      this._burstNoise(t, 0.05, 0.12, 900, 0.8);
    }
  }

  pickup() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._osc('sine', 520, t, 0.12, 0.08, 0.1);
    this._osc('sine', 780, t + 0.07, 0.14, 0.07, 0.12);
  }

  medkit() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._osc('sine', 360, t, 0.2, 0.08, 0.18);
    this._osc('sine', 540, t + 0.08, 0.22, 0.07, 0.18);
  }

  wave() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._osc('triangle', 110, t, 0.6, 0.12, 0.5);
    this._osc('sine', 220, t + 0.12, 0.5, 0.08, 0.4);
  }

  groan(x, y, z, intensity = 1) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    const startF = 70 + Math.random() * 40;
    osc.frequency.setValueAtTime(startF, t);
    osc.frequency.linearRampToValueAtTime(startF * (0.7 + Math.random() * 0.25), t + 0.45);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420 + Math.random() * 180;

    const panner = this.ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 4;
    panner.maxDistance = 48;
    panner.rolloffFactor = 1.1;
    if (panner.positionX) {
      panner.positionX.value = x;
      panner.positionY.value = y;
      panner.positionZ.value = z;
    }

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2 * intensity, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

    osc.connect(filter);
    filter.connect(g);
    g.connect(panner);
    panner.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.9);
    this._osc('sawtooth', startF * 0.55, t, 0.7, 0.08 * intensity, 0.6);
  }

  explode() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._burstNoise(t, 0.38, 0.72, 220, 0.55);
    this._osc('sawtooth', 70, t, 0.45, 0.32, 0.38);
    this._osc('square', 38, t, 0.55, 0.26, 0.46);
    this._osc('triangle', 180, t + 0.04, 0.2, 0.12, 0.16);
  }

  attack() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._burstNoise(t, 0.12, 0.16, 500, 0.7);
    this._osc('sawtooth', 60, t, 0.18, 0.1, 0.14);
  }

  startMusic() {
    this.resume();
    if (!this.ctx || this._musicOn) return;
    this._musicOn = true;
    const ctx = this.ctx;
    const bus = ctx.createGain();
    bus.gain.value = 0.0001;
    bus.connect(this.master);
    bus.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 1.6);
    this._musicBus = bus;
    this._musicNodes = [];

    const drone = (freq, type, gain, cutoff, detune = 0) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = cutoff;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(filter);
      filter.connect(g);
      g.connect(bus);
      osc.start();
      this._musicNodes.push(osc);
    };

    drone(55, 'sine', 0.24, 160);
    drone(82.41, 'sine', 0.1, 200, 5);
    drone(220, 'triangle', 0.04, 900, -7);
    drone(329.63, 'sine', 0.028, 1100, 4);

    if (this._noise) {
      const wind = ctx.createBufferSource();
      wind.buffer = this._noise;
      wind.loop = true;
      const wf = ctx.createBiquadFilter();
      wf.type = 'lowpass';
      wf.frequency.value = 380;
      const wg = ctx.createGain();
      wg.gain.value = 0.035;
      wind.connect(wf);
      wf.connect(wg);
      wg.connect(bus);
      wind.start();
      this._musicNodes.push(wind);
    }

    this._musicStep = 0;
    this._scheduleMusic(ctx.currentTime + 0.5);
  }

  _tone(freq, when, dur, peak, type, cutoff) {
    if (!this.ctx || !this._musicBus) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), when + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this._musicBus);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  _scheduleMusic(when) {
    if (!this._musicOn || !this.ctx) return;
    const melody = [220, 261.63, 329.63, 392, 329.63, 261.63, 246.94, 196];
    const bass = [55, 55, 43.65, 65.41];
    const step = this._musicStep % 8;
    this._tone(melody[step], when, 1.4, 0.042, 'triangle', 1400);
    this._tone(bass[step % 4], when, 1.65, 0.08, 'sine', 170);
    if (step % 4 === 0) this._tone(110, when, 0.16, 0.05, 'sine', 140);
    this._musicStep += 1;
    const next = when + 1.75;
    const delay = Math.max(60, (next - this.ctx.currentTime) * 1000);
    this._musicTimer = window.setTimeout(() => this._scheduleMusic(next), delay);
  }

  stopMusic() {
    this._musicOn = false;
    if (this._musicTimer) {
      window.clearTimeout(this._musicTimer);
      this._musicTimer = 0;
    }
    const bus = this._musicBus;
    const nodes = this._musicNodes;
    this._musicBus = null;
    this._musicNodes = [];
    if (bus && this.ctx) {
      const t = this.ctx.currentTime;
      bus.gain.cancelScheduledValues(t);
      bus.gain.setValueAtTime(Math.max(bus.gain.value, 0.0001), t);
      bus.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    }
    window.setTimeout(() => {
      for (const n of nodes) {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      }
      try {
        bus?.disconnect();
      } catch {
        /* already disconnected */
      }
    }, 800);
  }
}
