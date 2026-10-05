/**
 * High-performance Web Audio API Sound Synthesizer for Games & App Interactivity.
 * Completely zero-dependency, works on Mobile, PC & Mac with instant unlock and volume scaling.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.5; // Default 50% volume

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.init();
        if (this.ctx && this.ctx.state === 'running') {
          window.removeEventListener('pointerdown', unlockAudio);
          window.removeEventListener('keydown', unlockAudio);
          window.removeEventListener('touchstart', unlockAudio);
        }
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.volume === 0) {
      this.enabled = false;
    } else {
      this.enabled = true;
    }
  }

  public init(): AudioContext | null {
    if (!this.enabled || this.volume <= 0) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq: number, duration: number = 0.08, type: OscillatorType = 'sine', baseVol: number = 0.2) {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const finalVol = Math.max(0.0001, baseVol * this.volume);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(finalVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  // Blade Slash / Hit sound
  playBladeHit() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.06);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.06);

      const gain = ctx.createGain();
      const finalVol = Math.max(0.0001, 0.3 * this.volume);
      gain.gain.setValueAtTime(finalVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      this.playTone(900, 0.05, 'triangle', 0.2);
    } catch {
      this.playTone(880, 0.08, 'sawtooth', 0.2);
    }
  }

  // Metallic Blade Clank / Bomb hit
  playBladeClank() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(340, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.2);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(180, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);

      const finalVol = Math.max(0.0001, 0.35 * this.volume);
      gain.gain.setValueAtTime(finalVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 0.25);
    } catch {
      this.playTone(220, 0.2, 'sawtooth', 0.3);
    }
  }

  // Bonus / Score / Coin Pickup
  playScore() {
    this.playTone(659.25, 0.08, 'sine', 0.2);
    setTimeout(() => this.playTone(987.77, 0.12, 'triangle', 0.25), 50);
  }

  // Start Game Sound
  playStart() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.1, 'sine', 0.2), idx * 60);
    });
  }

  // Game Over Sound
  playGameOver() {
    this.playTone(400, 0.12, 'sawtooth', 0.3);
    setTimeout(() => this.playTone(310, 0.15, 'sawtooth', 0.3), 110);
    setTimeout(() => this.playTone(180, 0.35, 'sawtooth', 0.35), 230);
  }

  // Bounce
  playBounce() {
    this.playTone(320, 0.06, 'triangle', 0.2);
  }

  // Jump
  playJump() {
    const ctx = this.init();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.12);
      const finalVol = Math.max(0.0001, 0.2 * this.volume);
      gain.gain.setValueAtTime(finalVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  // Merge (2048)
  playMerge() {
    this.playTone(440, 0.07, 'triangle', 0.2);
    setTimeout(() => this.playTone(660, 0.1, 'sine', 0.25), 45);
  }

  playPop() {
    this.playTone(700, 0.04, 'sine', 0.25);
  }

  playWin() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.12, 'triangle', 0.2), idx * 80);
    });
  }

  // Phone audio for Nexus and Community Call features
  playPhoneRing() {
    this.playTone(440, 0.4, 'sine', 0.25);
    setTimeout(() => this.playTone(480, 0.4, 'sine', 0.25), 50);
  }

  playCallConnected() {
    this.playTone(523.25, 0.1, 'sine', 0.2);
    setTimeout(() => this.playTone(659.25, 0.15, 'triangle', 0.2), 120);
  }

  playCallEnd() {
    this.playTone(425, 0.2, 'sine', 0.2);
    setTimeout(() => this.playTone(425, 0.2, 'sine', 0.2), 300);
  }

  // Aliases for full compatibility
  start() { this.playStart(); }
  score() { this.playScore(); }
  slice() { this.playBladeHit(); }
  hit() { this.playGameOver(); }
  jump() { this.playJump(); }
  merge() { this.playMerge(); }
  phoneRing() { this.playPhoneRing(); }
  callConnected() { this.playCallConnected(); }
  callEnd() { this.playCallEnd(); }
  over() { this.playGameOver(); }
}

export const gameSound = new SoundEngine();
