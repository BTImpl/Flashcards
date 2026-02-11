import { Component, inject, OnInit } from '@angular/core';
import { Word } from 'src/app/model/words.model';
import { WordService } from 'src/app/services/words.service';
import { PairingForm, PairingWord } from './pairing.model';
import { NgFor } from '@angular/common';
import { WordCardComponent } from '../../components/word-card/word-card.component';

@Component({
    selector: 'app-pairing',
    templateUrl: './pairing.component.html',
    styleUrls: ['./pairing.component.css'],
    imports: [NgFor, WordCardComponent]
})
export class PairingComponent implements OnInit {
private wordService = inject(WordService);
private words: Word[] = [];
  displayedWordsCount: number = 4;
  matchedWordsCount: number = 0;
  actualStartIndex: number = 0;
  actualWords: PairingWord[] = [];
  shuffledWords: PairingWord[] = [];
  selectedEn: number = -1;
  selectedHu: number = -1;
  lenth: number = 0;

  ngOnInit(): void {
    this.words = this.wordService.getWords();
    this.lenth = this.words.length;
    this.wordService.shuffle(this.words);
    this.startRound();
  }

  wordClicked(lang: string, idx: number){
    if (lang === 'en'){
      if(this.selectedEn !== -1){
        this.actualWords[this.selectedEn].en.activeClass = 'bg-dark';
      }
      this.selectedEn = idx;
      this.actualWords[this.selectedEn].en.activeClass = 'bg-info';
    } else {
      if(this.selectedHu !== -1){
        this.shuffledWords[this.selectedHu].hu.activeClass = 'bg-dark';
      }
      this.selectedHu = idx;
      this.shuffledWords[this.selectedHu].hu.activeClass = 'bg-info';
    }

    if(this.selectedEn !== -1 && this.selectedHu !== -1){
      if(this.actualWords[this.selectedEn].hu === this.shuffledWords[this.selectedHu].hu){
        this.matchedWordsCount++;
        this.actualWords[this.selectedEn].en.visible = false;
        this.shuffledWords[this.selectedHu].hu.visible = false;
      }
      this.actualWords[this.selectedEn].en.activeClass = 'bg-dark';
      this.shuffledWords[this.selectedHu].hu.activeClass = 'bg-dark';

      if(this.matchedWordsCount === this.displayedWordsCount){
       this.next();
      }
      this.selectedEn = -1;
      this.selectedHu = -1;
    }
  }

  private startRound(){
    this.matchedWordsCount = 0;
  this.actualWords = [];
  this.shuffledWords = [];
  this.selectedEn = -1;
  this.selectedHu = -1;
    const words: Word[] = this.words.slice(this.actualStartIndex, this.actualStartIndex + this.displayedWordsCount);

    for (let w of words){
      this.actualWords.push({
        hu: {
          value: w.hu,
          visible: true,
          activeClass: 'bg-dark',
          speakable: false
        },
        en: {
          value: w.en,
          visible: true,
          activeClass: 'bg-dark',
          speakable: true
        }
      });
    }
    this.shuffledWords = [...this.actualWords];
    this.wordService.shuffle(this.shuffledWords);
  }

  prev(){
    if(this.actualStartIndex - this.displayedWordsCount <= 0){
      this.actualStartIndex = 0;
    } else {
      this.actualStartIndex -= this.displayedWordsCount;
    }

  this.startRound();

  }

  next(){
    if(this.actualStartIndex + this.displayedWordsCount >= this.lenth -1){
      this.actualStartIndex = this.lenth - this.displayedWordsCount ;
    } else {
      this.actualStartIndex += this.displayedWordsCount;
    }

  this.startRound();
  }

}
