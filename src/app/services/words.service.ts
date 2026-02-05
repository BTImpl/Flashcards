import { Injectable } from '@angular/core';
import { Word, Words } from '../model/words.model';

@Injectable({
  providedIn: 'root',
})
export class WordService {
  getWords(): Word[] {
    return [
      { hu: 'kutya', en: 'dog' },
      { hu: 'macska', en: 'cat' },
      { hu: 'ház', en: 'house' },
      { hu: 'fa', en: 'tree' },
      { hu: 'autó', en: 'car' },
    ];
  }


  shuffle(array: any) {
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

  speakPhrase(text: string) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find(
      (v) => v.lang === 'en-GB' || v.lang.includes('GB'),
    );

    if (ukVoice) {
      utterance.voice = ukVoice;
    }

    utterance.lang = 'en-GB';
    utterance.rate = 0.9;

    window.speechSynthesis.speak(utterance);
  }
}
