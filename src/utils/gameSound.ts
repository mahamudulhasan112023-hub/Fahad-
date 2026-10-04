/**
 * Simple, zero-dependency Web Audio API sound synthesizer for games.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a single tone
  playTone(freq: number, duration: number = 0.08, type: OscillatorType = 'sine', volume: number = 0.15) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext could be blocked by browser policy
    }
  }

  // Eat / Pickup sound (Snake)
  playEat() {
    this.playTone(587.33, 0.08, 'triangle', 0.2); // D5
    setTimeout(() => this.playTone(880, 0.1, 'sine', 0.2), 70); // A5
  }

  // Bounce / Hit sound (Brick Breaker)
  playBounce() {
    this.playTone(440, 0.05, 'triangle', 0.15);
  }

  // Smash Brick sound
  playSmash() {
    this.playTone(659.25, 0.06, 'square', 0.12);
    setTimeout(() => this.playTone(987.77, 0.08, 'triangle', 0.12), 40);
  }

  // Jump sound (Flappy / Cyber Jet)
  playJump() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  // Score / Coin sound
  playScore() {
    this.playTone(784, 0.06, 'triangle', 0.15);
    setTimeout(() => this.playTone(1046.5, 0.12, 'sine', 0.15), 50);
  }

  // Blade Hit Target sound
  playBladeHit() {
    this.playTone(800, 0.05, 'triangle', 0.18);
    setTimeout(() => this.playTone(1200, 0.08, 'sine', 0.15), 30);
  }

  // Blade Clank / Crash sound
  playBladeClank() {
    this.playTone(350, 0.08, 'sawtooth', 0.25);
    setTimeout(() => this.playTone(220, 0.15, 'sawtooth', 0.2), 60);
  }

  // Slice sound for Stack
  playSlice() {
    this.playTone(600, 0.05, 'triangle', 0.16);
    setTimeout(() => this.playTone(350, 0.06, 'sawtooth', 0.12), 30);
  }

  // Harmonic chord combo for perfect stack
  playCombo(step: number = 0) {
    const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25];
    const freq = scale[Math.min(scale.length - 1, step % scale.length)];
    this.playTone(freq, 0.12, 'sine', 0.22);
    setTimeout(() => this.playTone(freq * 1.5, 0.14, 'triangle', 0.15), 40);
  }

  // Merge sound (2048)
  playMerge() {
    this.playTone(330, 0.06, 'triangle', 0.15);
    setTimeout(() => this.playTone(523.25, 0.1, 'sine', 0.18), 40);
  }

  // Slide sound (2048)
  playSlide() {
    this.playTone(220, 0.04, 'sine', 0.08);
  }

  // Start game sound
  playStart() {
    this.playTone(440, 0.08, 'sine', 0.2);
    setTimeout(() => this.playTone(660, 0.12, 'triangle', 0.2), 60);
  }

  // Pop / Hit alias
  playPop() {
    this.playBounce();
  }

  // Perfect / High score alias
  playPerfect() {
    this.playWin();
  }

  // Aliases for convenience
  jump() { this.playJump(); }
  start() { this.playStart(); }
  score() { this.playScore(); }
  hit() { this.playGameOver(); }
  slice() { this.playSlice(); }
  merge() { this.playMerge(); }

  // Phone Ringtone sound
  playPhoneRing() {
    this.playTone(440, 0.4, 'sine', 0.25);
    setTimeout(() => this.playTone(480, 0.4, 'sine', 0.25), 50);
  }

  // Call connected sound
  playCallConnected() {
    this.playTone(523.25, 0.1, 'sine', 0.2);
    setTimeout(() => this.playTone(659.25, 0.15, 'triangle', 0.2), 120);
  }

  // Call End / Busy sound
  playCallEnd() {
    this.playTone(425, 0.2, 'sine', 0.2);
    setTimeout(() => this.playTone(425, 0.2, 'sine', 0.2), 300);
  }

  phoneRing() { this.playPhoneRing(); }
  callConnected() { this.playCallConnected(); }
  callEnd() { this.playCallEnd(); }

  // Game over sound
  playGameOver() {
    this.playTone(400, 0.1, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(300, 0.15, 'sawtooth', 0.2), 100);
    setTimeout(() => this.playTone(180, 0.3, 'sawtooth', 0.25), 220);
  }

  // Over alias
  playOver() {
    this.playGameOver();
  }

  // Victory / Win sound
  playWin() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.12, 'triangle', 0.2), idx * 80);
    });
  }
}

export const gameSound = new SoundEngine();
