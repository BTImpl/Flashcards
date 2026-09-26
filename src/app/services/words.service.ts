import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WordService {
  private voices: SpeechSynthesisVoice[] = [];
  private hasPrimedSpeech = false;

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

  /*speakPhrase(text?: string) {
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
  }*/


private audioContext: AudioContext | null = null;
private silentAudioEl: HTMLAudioElement | null = null;

speakPhrase(text?: string) {
  if (!text) return;

  // 2. NÉMA ÜZEMMÓD ÁTTÖRÉSE (Csak az első interakciónál épül fel, utána újrahasznosul)
  try {
    if (!this.silentAudioEl) {
      // Létrehozunk egy fizikai audio elemet
      this.silentAudioEl = new Audio();
      this.silentAudioEl.src = 'data:audio/mp3;base64,SUQzBAAAAAAAAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEgAAA21pbm9yX3ZlcnNpb24AMgBUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAG1wNDJtcDQxAAAAbVVsdGFjMAD/////gAAAAAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVsdGFjMAD/////gAAAAAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
      this.silentAudioEl.loop = true; // Folyamatosan ébren tartja a média csatornát
      this.silentAudioEl.volume = 0.01; // Szinte teljesen halk, de aktív

      // iOS specifikus attribútumok, hogy ne ugorjon fel a rendszerszintű médialejátszó
      this.silentAudioEl.setAttribute('playsinline', 'true');
      this.silentAudioEl.setAttribute('x-webkit-airplay', 'allow');

      // Létrehozzuk a kontextust és összekötjük az audio elemmel
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaElementSource(this.silentAudioEl);
      source.connect(this.audioContext.destination);
    }

    // Minden gombnyomásra újraindítjuk/ébren tartjuk
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.silentAudioEl.play().catch(err => console.log("Audio play sikertelen:", err));

  } catch (e) {
    console.error("Néma üzemmód megkerülési hiba:", e);
  }

  // 3. A SPEECH SYNTHESIS RÉSZ (A te meglévő logikád)
  const synth = window.speechSynthesis;

  if (synth.speaking || synth.pending) {
    synth.cancel();
  }
  synth.resume();

  if (!this.hasPrimedSpeech) {
    this.hasPrimedSpeech = true;
    synth.speak(new SpeechSynthesisUtterance(' '));
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const ukVoice = this.voices.find((v) => v.lang === 'en-GB' || v.lang.includes('GB'));

  if (ukVoice) {
    utterance.voice = ukVoice;
  }

  utterance.lang = 'en-GB';
  utterance.rate = 0.9;

  // iOS 16+ bug javítás: A Safari hajlamos eldobni a hangot, ha túl gyorsan hívjuk az Audio után.
  // Egy minimális timeout garantálja, hogy a média csatorna már aktív legyen.
  setTimeout(() => {
    synth.speak(utterance);
  }, 50);
}

}
