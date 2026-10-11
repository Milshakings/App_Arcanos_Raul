/**
 * Web Audio API based ambient sound generator for sacred tarot atmosphere.
 * Plays 432Hz harmonic singing bowl drone and celestial chime when cards flip.
 */
class MysticSoundManager {
  private ctx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isDroneActive: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleDrone(): boolean {
    this.initContext();
    if (!this.ctx) return false;

    if (this.isDroneActive) {
      this.stopDrone();
      return false;
    } else {
      this.startDrone();
      return true;
    }
  }

  public isDronePlaying(): boolean {
    return this.isDroneActive;
  }

  private startDrone() {
    if (!this.ctx) return;
    this.stopDrone();

    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.01, this.ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 3);
    master.connect(this.ctx.destination);
    this.droneGain = master;

    // Harmonic singing bowl frequencies: Fundamental (108Hz), Fifth (162Hz), Octave (216Hz), Sacred (432Hz)
    const frequencies = [108, 162, 216, 432];
    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), this.ctx.currentTime);

      // Subtle LFO modulation for shimmer
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(freq * 0.015, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.08 / (idx + 1), this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(master);
      osc.start();
    });

    this.isDroneActive = true;
  }

  public stopDrone() {
    if (this.droneGain && this.ctx) {
      try {
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.5);
      } catch {
        // noop
      }
    }
    this.isDroneActive = false;
  }

  public playCardFlip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      // Pleasant mystical chime harmonic
      osc.frequency.setValueAtTime(528, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(852, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch {
      // Audio autoplay policy handled
    }
  }

  public playShuffleSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Quick gentle white noise burst for card rustle
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {
      // Audio context policy handled
    }
  }
}

export const mysticAudio = new MysticSoundManager();
