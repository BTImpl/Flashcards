import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { WordCardModel } from './word-card.model';
import { WordService } from 'src/app/services/words.service';

@Component({
  selector: 'app-word-card',

  templateUrl: './word-card.component.html',
    styleUrls: ['./word-card.component.css'],
  standalone: false
})
export class WordCardComponent {
  @Input() word: WordCardModel = { value: '', visible: true, activeClass: 'bg-dark', speakable: false };
  @Output() cardClicked = new EventEmitter<void>();

   private wordService = inject(WordService);

  wordClicked() {
    this.cardClicked.emit();
  }

  speak(event: Event){
    this.wordService.speakPhrase(this.word.value);
    event.stopPropagation();
  }
}
