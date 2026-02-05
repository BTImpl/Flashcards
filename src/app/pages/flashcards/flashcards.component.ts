import { Component, OnInit } from '@angular/core';
import { WordCardModel } from 'src/app/components/word-card/word-card.model';
import { Word } from 'src/app/model/words.model';
import { WordService } from 'src/app/services/words.service';

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.css'],
  standalone: false,
})
export class FlashcardsComponent implements OnInit {
  words = this.wordService.getWords();
  actualWordIdx: number = 0;
  actualWord: Word = { hu: '', en: '' };

  actual: WordCardModel = { value: '', visible: true, activeClass: 'bg-dark', speakable: false };
  enWord: WordCardModel = { value: '', visible: true, activeClass: 'bg-dark', speakable: false };
  huWord: WordCardModel = { value: '', visible: true, activeClass: 'bg-dark', speakable: false };

  constructor(private wordService: WordService) {}

  ngOnInit(): void {
    this.wordService.shuffle(this.words);
    this.actualWord = this.words[this.actualWordIdx];
    this.setActualWordCard(this.actualWord);
  }

  next() {
    if (this.actualWordIdx + 1 < this.words.length) {
      this.actualWordIdx++;
      this.actualWord = this.words[this.actualWordIdx];
      this.setActualWordCard(this.actualWord);
    }
  }

  previous() {
    if (this.actualWordIdx > 0) {
      this.actualWordIdx--;
      this.actualWord = this.words[this.actualWordIdx];
      this.setActualWordCard(this.actualWord);
    }
  }

  flip(){
    if(this.actual === this.enWord){
      this.actual = this.huWord;
    } else {
      this.actual = this.enWord;
    }
  }

  private setActualWordCard(word: Word){
    this.enWord = { value: word.en, visible: true, activeClass: 'bg-dark', speakable: true };
    this.huWord = { value: word.hu, visible: true, activeClass: 'bg-dark', speakable: false };
    this.actual = this.enWord;
  }

}
