/**
 * Web Speech API voice synthesis helper for simulated patient speech
 */

class VoiceAssistant {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public speak(text: string, gender: 'Female' | 'Male' | 'Non-binary' = 'Female', rate = 0.95, pitch = 1.0) {
    if (!this.synth) return;

    try {
      this.synth.cancel(); // Stop any active speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Pick appropriate voice if available
      const voiceList = this.voices.length > 0 ? this.voices : this.synth.getVoices();
      if (voiceList.length > 0) {
        const langVoices = voiceList.filter((v) => v.lang.startsWith('en'));
        const pool = langVoices.length > 0 ? langVoices : voiceList;

        if (gender === 'Female') {
          const femaleVoice = pool.find((v) => /female|samantha|zira|victoria|karen|susan|moira/i.test(v.name));
          if (femaleVoice) utterance.voice = femaleVoice;
        } else {
          const maleVoice = pool.find((v) => /male|david|george|james|daniel|oliver/i.test(v.name));
          if (maleVoice) utterance.voice = maleVoice;
        }
      }

      this.synth.speak(utterance);
    } catch (e) {
      // Speech may be suppressed by browser autoplay or sandbox policy
      console.warn('SpeechSynthesis unavailable or blocked in current sandbox:', e);
    }
  }

  public stop() {
    try {
      if (this.synth) {
        this.synth.cancel();
      }
    } catch {
      // Ignore
    }
  }

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

export const speechService = new VoiceAssistant();
