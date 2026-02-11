import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { timer } from 'rxjs';
import { WordService } from 'src/app/services/words.service';
import { WordCardComponent } from '../../components/word-card/word-card.component';
import { LearnWordModel } from './learn-word.model';

@Component({
    selector: 'app-learn-words',
    templateUrl: './learn-words.component.html',
    styleUrls: ['./learn-words.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule, WordCardComponent, TranslatePipe]
})
export class LearnWordsComponent implements OnInit {
  private wordService = inject(WordService);
  private cdr = inject(ChangeDetectorRef);
  cards: LearnWordModel[] = [];
  actualIdx = 0;
  actualWord: LearnWordModel = { hu: { value: '', visible: true, activeClass: 'bg-dark', speakable: false }, en: { value: '', visible: true, activeClass: 'bg-dark', speakable: false } };
  possibleWords: LearnWordModel[] = [];
  success: number = 0;
  failed: number = 0;
  wasFailed: boolean = false;
  questionLang: keyof LearnWordModel = 'en';
  answerLang: keyof LearnWordModel = 'hu';

  ngOnInit(): void {
    const words = this.wordService.getWords();
    this.cards = words.map(word => ({ hu: { value: word.hu, visible: true, activeClass: 'bg-dark', speakable: false }, en: { value: word.en, visible: true, activeClass: 'bg-dark', speakable: false } }));
    this.wordService.shuffle(this.cards);

    this.actualIdx = 0;
    this.next(this.actualIdx);
  }

  getRandomWordsExcept(words: LearnWordModel[]): LearnWordModel[] {
    const filtered = words.filter((_, index) => index !== this.actualIdx);
    const shuffled = [...filtered];
    this.wordService.shuffle(shuffled);
    return shuffled.slice(0, 3);
  }

  wordClicked(idx: number){
    if(this.actualWord.en.value === this.possibleWords[idx].en.value){
      if(!this.wasFailed){
        this.success++;
      }
      this.possibleWords[idx][this.answerLang].activeClass = 'bg-success';
      timer(200).subscribe(() => {
        this.actualIdx++;
        this.next(this.actualIdx);
        this.cdr.markForCheck();
      });
    } else {
      if(!this.wasFailed){
        this.failed++;
        this.wasFailed = true;
      }
      this.possibleWords[idx][this.answerLang].activeClass = 'bg-danger';
    }
  }

  private next(idx: number = 0){
    this.wasFailed = false;
    for(let w of this.possibleWords){
      w[this.answerLang].activeClass = 'bg-dark';
    }
    if(idx === this.cards.length){
      return;
    }
    this.actualWord = this.cards[idx];
    this.possibleWords = this.getRandomWordsExcept(this.cards);
    this.possibleWords.push(this.actualWord);
    this.wordService.shuffle(this.possibleWords);
  }

  restart(){
    this.wordService.shuffle(this.cards);
    this.actualIdx = 0;
    this.success = 0;
    this.failed = 0;
    this.next(this.actualIdx);
  }

  speak(){
    this.wordService.speakPhrase(this.actualWord.en.value);
  }

  toggleLang(){
     this.wasFailed = false;
    for(let w of this.possibleWords){
      w[this.answerLang].activeClass = 'bg-dark';
    }
    if(this.questionLang === 'en'){
      this.questionLang = 'hu';
      this.answerLang = 'en';
    } else {
      this.questionLang = 'en';
      this.answerLang = 'hu';
    }
    this.restart();
  }

  //TODO itt masik model kell, mert kell a magyar es az angol is
}
