import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WordService {
  private voices: SpeechSynthesisVoice[] = [];

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
      }
    });
  }

  private loadVoices() {
    this.voices = window.speechSynthesis.getVoices();
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
