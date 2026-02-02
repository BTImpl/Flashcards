import { Injectable } from "@angular/core";
import { Word, Words } from "../model/words.model";

@Injectable({
  providedIn: 'root'
})
export class WordService {
  getWords(): Word[] {
    return [
      { hu: 'kutya', en: 'dog' },
      { hu: 'macska', en: 'cat' },
      { hu: 'ház', en: 'house' },
      { hu: 'fa', en: 'tree' },
      { hu: 'autó', en: 'car' }
    ];
  }
}
