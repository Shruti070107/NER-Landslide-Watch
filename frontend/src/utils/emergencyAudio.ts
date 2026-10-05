/**
 * Emergency Siren & Audio System
 * Uses Web Audio API for guaranteed, zero-dependency browser emergency sirens.
 * Also provides high-urgency alert chimes and speech synthesizer notifications.
 */

class EmergencyAudioService {
  private audioCtx: AudioContext | null = null;
  private primaryOsc: OscillatorNode | null = null;
  private secondaryOsc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private modulationInterval: number | null = null;
  private isAlarmPlaying = false;
  private listeners: Array<(isPlaying: boolean) => void> = [];

  public subscribe(callback: (isPlaying: boolean) => void): () => void {
    this.listeners.push(callback);
    callback(this.isAlarmPlaying);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.isAlarmPlaying));
  }

  public getIsPlaying(): boolean {
    return this.isAlarmPlaying;
  }

  /**
   * Triggers loud, oscillating disaster evacuation emergency siren.
   * Modulates frequencies between 650Hz and 1050Hz in rapid pulses.
   */
  public playSosAlarm(autoStopSeconds: number = 15): void {
    try {
      // If already playing, don't duplicate
      if (this.isAlarmPlaying) {
        return;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported in this browser.');
        return;
      }

      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;

      // Master Gain
      this.gainNode = ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      this.gainNode.connect(ctx.destination);

      // Primary Siren Oscillator (Sawtooth wave for harsh emergency horn quality)
      this.primaryOsc = ctx.createOscillator();
      this.primaryOsc.type = 'sawtooth';
      this.primaryOsc.frequency.setValueAtTime(650, ctx.currentTime);
      this.primaryOsc.connect(this.gainNode);
      this.primaryOsc.start();

      // Secondary Harmonizing Oscillator for multi-tone industrial disaster alarm
      this.secondaryOsc = ctx.createOscillator();
      this.secondaryOsc.type = 'square';
      this.secondaryOsc.frequency.setValueAtTime(780, ctx.currentTime);
      const secondaryGain = ctx.createGain();
      secondaryGain.gain.setValueAtTime(0.12, ctx.currentTime);
      this.secondaryOsc.connect(secondaryGain);
      secondaryGain.connect(this.gainNode);
      this.secondaryOsc.start();

      this.isAlarmPlaying = true;
      this.notifyListeners();

      // Frequency Modulation Loop (Rapid undulating landslide evacuation pitch)
      let rising = true;
      let currentFreq = 650;
      this.modulationInterval = window.setInterval(() => {
        if (!this.primaryOsc || !this.audioCtx) return;

        if (rising) {
          currentFreq += 35;
          if (currentFreq >= 1050) rising = false;
        } else {
          currentFreq -= 35;
          if (currentFreq <= 650) rising = true;
        }

        const t = this.audioCtx.currentTime;
        this.primaryOsc.frequency.setValueAtTime(currentFreq, t);
        if (this.secondaryOsc) {
          this.secondaryOsc.frequency.setValueAtTime(currentFreq * 1.2, t);
        }
      }, 35);

      // Speak Emergency Dispatch Voice Announcement via SpeechSynthesis
      this.speakAnnouncement('Emergency S O S beacon activated. Rescue command alerted.');

      // Auto-stop after specified duration to prevent infinite blaring
      if (autoStopSeconds > 0) {
        window.setTimeout(() => {
          if (this.isAlarmPlaying) {
            this.stopAlarm();
          }
        }, autoStopSeconds * 1000);
      }
    } catch (err) {
      console.error('Failed to trigger emergency audio:', err);
    }
  }

  /**
   * Silences the active alarm immediately
   */
  public stopAlarm(): void {
    try {
      if (this.modulationInterval) {
        clearInterval(this.modulationInterval);
        this.modulationInterval = null;
      }

      if (this.primaryOsc) {
        this.primaryOsc.stop();
        this.primaryOsc.disconnect();
        this.primaryOsc = null;
      }

      if (this.secondaryOsc) {
        this.secondaryOsc.stop();
        this.secondaryOsc.disconnect();
        this.secondaryOsc = null;
      }

      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }

      if (this.audioCtx) {
        this.audioCtx.close();
        this.audioCtx = null;
      }
    } catch (err) {
      console.warn('Error stopping emergency audio:', err);
    } finally {
      this.isAlarmPlaying = false;
      this.notifyListeners();
    }
  }

  /**
   * Short 2-pip alert chime for warnings and status updates
   */
  public playAlertBeep(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1174, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);

      setTimeout(() => {
        ctx.close();
      }, 500);
    } catch (err) {
      console.warn('Beep error:', err);
    }
  }

  /**
   * Browser Text-to-Speech announcement
   */
  public speakAnnouncement(text: string): void {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis failed:', err);
      }
    }
  }
}

export const emergencyAudio = new EmergencyAudioService();
