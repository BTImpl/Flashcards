import { WordCardModel } from "src/app/components/word-card/word-card.model";

export interface PairingForm {
  words: PairingWord[];
}

export interface PairingWord {
  hu: WordCardModel;
  en: WordCardModel;
}


