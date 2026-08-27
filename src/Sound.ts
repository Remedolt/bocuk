export class Sound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;

  resume(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    }
    void this.ctx.resume();
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain = 0.2,
    slide = 0,
  ): void {
    if (!this.ctx || !this.master || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  shoot(pitch = 880): void {
    this.tone(pitch, 0.06, 'square', 0.08, -420);
  }

  hit(): void {
    this.tone(220, 0.08, 'sawtooth', 0.1, -80);
  }

  pickup(): void {
    this.tone(880, 0.09, 'sine', 0.1, 420);
  }

  hurt(): void {
    this.tone(140, 0.18, 'sawtooth', 0.16, -60);
  }

  death(): void {
    this.tone(90, 0.35, 'triangle', 0.18, -40);
  }

  shop(): void {
    this.tone(520, 0.12, 'sine', 0.1, 200);
  }

  wave(): void {
    this.tone(196, 0.22, 'square', 0.12, 180);
  }
}
