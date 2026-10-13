/**
 * Web Audio API Sound Synthesizer for Talqa Net
 * Zero external audio files, 100% offline-ready and ultra-fast.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('talqa_sound_enabled');
        if (saved !== null) {
          this.enabled = saved === 'true';
        }
      } catch {
        this.enabled = true;
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('talqa_sound_enabled', String(this.enabled));
    } catch {}
    if (this.enabled) {
      this.playTap();
    }
    return this.enabled;
  }

  public playTap() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  public playWheelTick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.02);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {}
  }

  public playFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];

      arpeggio.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteStart = now + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.16, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          noteStart + (idx === arpeggio.length - 1 ? 0.9 : 0.25)
        );

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + (idx === arpeggio.length - 1 ? 0.9 : 0.25));
      });
    } catch {}
  }

  public playSuccess() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);

        gain.gain.setValueAtTime(0, now + index * 0.06);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.3);
      });
    } catch {}
  }

  public playError() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.2);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }
}

export const soundManager = new SoundController();
