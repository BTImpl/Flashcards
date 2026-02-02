import { Component, Input } from '@angular/core';
import { Word } from 'src/app/model/words.model';

@Component({
    selector: 'app-word-card',
    templateUrl: './word-card.component.html',
    styleUrls: ['./word-card.component.css'],
    standalone: false
})
export class WordCardComponent {
  @Input() word: Word = { hu: '', en: '' };
  actualLang: keyof Word = 'en';
  value: string = '';

  constructor(){
    alert(JSON.stringify(this.word));
    this.value = this.word[this.actualLang];
  }

  flip(){
    if(this.actualLang === 'en'){
      this.actualLang = 'hu';
    } else {
      this.actualLang = 'en';
    }
     this.value = this.word[this.actualLang];
  }
}
