import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WordService {
  private voices: SpeechSynthesisVoice[] = [];
  private hasPrimedSpeech = false;
  private audioContext?: AudioContext;

  constructor() {
    this.loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', () =>
      this.loadVoices(),
    );

    // iOS leaves speechSynthesis stuck paused after a standalone home-screen
    // app is backgrounded (app switch, lock screen) - silently swallowing
    // every speak() call afterwards until resumed.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        window.speechSynthesis.resume();
        this.audioContext?.resume();
      }
    });
  }

  private loadVoices() {
    this.voices = window.speechSynthesis.getVoices();
  }

  // iOS mutes speechSynthesis (like any page audio) whenever the hardware
  // mute switch is on, unless the page's audio session is promoted to the
  // 'playback' category - only iOS can do that, only from inside a real
  // user gesture, and only via this WebKit-only API (falls back to waking a
  // WebAudio context for older iOS versions that lack it, which is reported
  // to have the same silent-switch-bypassing effect).
  private unlockAudioForSilentMode() {
    const audioSession = (
      navigator as Navigator & { audioSession?: { type: string } }
    ).audioSession;
    if (audioSession) {
      audioSession.type = 'playback';
    }

    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextCtor) return;

    this.audioContext ??= new AudioContextCtor();
    if (this.audioContext.state !== 'running') {
      this.audioContext.resume();
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioContext.createBuffer(1, 1, 22050);
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  shuffle<T>(array: T[]): void {
    let currentIndex = array.length;
    while (currentIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  }

  speakPhrase(text?: string) {
    if(!text) return;

    const synth = window.speechSynthesis;

    // Cancelling with nothing queued, and speaking into a still-paused
    // engine, are both known to silently no-op on iOS standalone PWAs.
    if (synth.speaking || synth.pending) {
      synth.cancel();
    }
    synth.resume();

    // iOS Safari (especially home-screen "Add to Home Screen" installs)
    // silently swallows the very first speak() call of a session and only
    // produces audio from the next call onwards. Burning that first failure
    // on a throwaway near-silent utterance, queued in the same gesture right
    // before the real one, means the user's first real tap is actually the
    // engine's second speak() call and gets heard.
    if (!this.hasPrimedSpeech) {
      this.hasPrimedSpeech = true;
      this.unlockAudioForSilentMode();
      synth.speak(new SpeechSynthesisUtterance(' '));
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const ukVoice = this.voices.find(
      (v) => v.lang === 'en-GB' || v.lang.includes('GB'),
    );

    if (ukVoice) {
      utterance.voice = ukVoice;
    }

    utterance.lang = 'en-GB';
    utterance.rate = 0.9;

    synth.speak(utterance);
  }
}
