// Sound Engine using Web Audio API for zero latency and crisp tactile feedback

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Check localStorage for saved sound preference
    const saved = localStorage.getItem('delux_sound_enabled');
    if (saved !== null) {
      this.soundEnabled = saved === 'true';
    } else {
      this.soundEnabled = true;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
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

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('delux_sound_enabled', enabled ? 'true' : 'false');
    if (enabled) {
      // Play a quick pleasant preview click when enabled
      this.play('select');
    }
  }

  public play(type: 'click' | 'select' | 'step' | 'success' | 'toggle' = 'click') {
    if (!this.soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'click') {
        // Soft tactile click (subtle high-to-mid frequency pop, reminiscent of iOS UI haptic click)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.045);

      } else if (type === 'select') {
        // Crisp card/option selection tick (two tiny rapid harmonic clicks)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.065);

      } else if (type === 'step') {
        // Forward navigation step sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.09);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.095);

      } else if (type === 'success') {
        // Uplifting pleasant two-tone completion chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc2.frequency.setValueAtTime(783.99, now + 0.16); // G5

        gain.gain.setValueAtTime(0.16, now);
        gain.gain.setValueAtTime(0.18, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.16);
        osc2.start(now + 0.16);
        osc2.stop(now + 0.35);

      } else if (type === 'toggle') {
        // Gentle toggle switch sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.05);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.055);
      }
    } catch {
      // AudioContext policy or unsupported browser - fail silently
    }
  }
}

export const soundManager = new SoundManager();

export const playButtonSound = () => soundManager.play('click');
export const playSelectSound = () => soundManager.play('select');
export const playStepSound = () => soundManager.play('step');
export const playSuccessSound = () => soundManager.play('success');
export const playToggleSound = () => soundManager.play('toggle');
