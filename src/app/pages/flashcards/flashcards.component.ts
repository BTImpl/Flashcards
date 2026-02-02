import { Component } from '@angular/core';
import { WordService } from 'src/app/services/words.service';

@Component({
    selector: 'app-flashcards',
    templateUrl: './flashcards.component.html',
    styleUrls: ['./flashcards.component.css'],
    standalone: false
})
export class FlashcardsComponent {
  words = this.wordService.getWords();
  actualWordIdx: number = 0;

  constructor(private wordService: WordService) {
  }


}
