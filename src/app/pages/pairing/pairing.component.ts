import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { WordsStore } from 'src/app/core/state/words.store';
import { WordService } from 'src/app/services/words.service';
import { WordCardComponent } from '../../components/word-card/word-card.component';
import { NavigationFooterComponent } from "src/app/components/navigation-footer/navigation-footer.component";
import { WordCardModel } from 'src/app/components/word-card/word-card.model';
import { Word } from 'src/app/model/words.model';

@Component({
  selector: 'app-pairing',
  standalone: true,
  imports: [WordCardComponent, NavigationFooterComponent],
  templateUrl: './pairing.component.html',
  styleUrls: ['./pairing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-flex flex-column flex-fill h-100' },
})
export class PairingComponent {
  private wordStore = inject(WordsStore);
  private wordService = inject(WordService);

  readonly displayedWordsCount = 4;
  readonly actualStartIndex = signal(0);
  readonly selectedEnIdx = signal<number | null>(null);
  readonly selectedHuIdx = signal<number | null>(null);
  readonly matchedHuValues = signal<Set<string>>(new Set());
  readonly allWords = computed(() => this.wordStore.words());
  readonly totalLength = computed(() => this.allWords().length);

  readonly currentPageWords = computed(() => {
    const start = this.actualStartIndex();
    return this.allWords().slice(start, start + this.displayedWordsCount);
  });

  readonly shuffledHuWords = signal<Word[]>([]);

  readonly enCards = computed<WordCardModel[]>(() =>
    this.currentPageWords().map((w, idx) => ({
      value: w.en,
      visible: !this.matchedHuValues().has(w.hu),
      activeClass: this.selectedEnIdx() === idx ? 'bg-info' : 'bg-dark',
      speakable: true
    }))
  );

  readonly huCards = computed<WordCardModel[]>(() =>
    this.shuffledHuWords().map((w, idx) => ({
      value: w.hu,
      visible: !this.matchedHuValues().has(w.hu),
      activeClass: this.selectedHuIdx() === idx ? 'bg-info' : 'bg-dark',
      speakable: false
    }))
  );

  constructor() {
    effect(() => {
      const wordsToShuffle = [...this.currentPageWords()];
      this.wordService.shuffle(wordsToShuffle);
      this.shuffledHuWords.set(wordsToShuffle);
    });
  }

  wordClicked(lang: 'en' | 'hu', idx: number) {
    if (lang === 'en') {
      this.selectedEnIdx.set(idx);
    } else {
      this.selectedHuIdx.set(idx);
    }

    const enIdx = this.selectedEnIdx();
    const huIdx = this.selectedHuIdx();

    if (enIdx !== null && huIdx !== null) {
      const enWord = this.currentPageWords()[enIdx];
      const huWord = this.shuffledHuWords()[huIdx];

      if (enWord.hu === huWord.hu) {
        this.matchedHuValues.update(prev => new Set(prev).add(enWord.hu));

        if (this.matchedHuValues().size === this.currentPageWords().length) {
          setTimeout(() => this.next(), 600);
        }
      }

      setTimeout(() => {
        this.selectedEnIdx.set(null);
        this.selectedHuIdx.set(null);
      }, 400);
    }
  }

  next() {
    const total = this.totalLength();
    const nextIndex = this.actualStartIndex() + this.displayedWordsCount;

    if (nextIndex < total) {
      if (nextIndex + this.displayedWordsCount > total) {
        this.resetRound(total - this.displayedWordsCount);
      } else {
        this.resetRound(nextIndex);
      }
    }
  }

  prev() {
    const prevIndex = Math.max(0, this.actualStartIndex() - this.displayedWordsCount);
    this.resetRound(prevIndex);
  }

  private resetRound(newIndex: number) {
    if (this.actualStartIndex() !== newIndex) {
      this.matchedHuValues.set(new Set());
      this.actualStartIndex.set(newIndex);
      this.selectedEnIdx.set(null);
      this.selectedHuIdx.set(null);
    }
  }
}
