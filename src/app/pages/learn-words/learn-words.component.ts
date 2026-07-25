import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { WordService } from 'src/app/services/words.service';
import { WordCardComponent } from '../../components/word-card/word-card.component';
import { LearnWordData, LangKey } from './learn-word.model';
import { WordsStore } from 'src/app/core/state/words.store';
import { FitTextDirective } from 'src/app/directives/fit-text.directive';

@Component({
  selector: 'app-learn-words',
  templateUrl: './learn-words.component.html',
  styleUrls: ['./learn-words.component.scss'],
  standalone: true,
  imports: [WordCardComponent, TranslatePipe, FitTextDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-flex flex-column flex-fill h-100' },
})
export class LearnWordsComponent {
  private wordStore = inject(WordsStore);
  private wordService = inject(WordService);

  readonly questionLang = signal<LangKey>('en');
  readonly answerLang = computed<LangKey>(() => (this.questionLang() === 'en' ? 'hu' : 'en'));

  readonly cards = signal<LearnWordData[]>([]);
  readonly actualIdx = signal(0);
  readonly success = signal(0);
  readonly failed = signal(0);
  readonly wasFailed = signal(false);
  readonly feedbackState = signal<{ clickedIndex: number; isCorrect: boolean } | null>(null);

  readonly currentWord = computed(() => this.cards()[this.actualIdx()]);
  readonly isGameOver = computed(() => this.actualIdx() >= this.cards().length && this.cards().length > 0);

  readonly currentOptions = signal<LearnWordData[]>([]);

  constructor() {
    effect(() => {
      const sourceWords = this.wordStore.words();
      untracked(() => {
        const mapped = sourceWords.map((w) => ({ hu: w.hu, en: w.en }));
        this.wordService.shuffle(mapped);
        this.cards.set(mapped);
        this.restart();
      });
    });
  }

  handleWordClick(optionIdx: number, selectedWord: LearnWordData) {
    if (this.feedbackState()?.isCorrect) return;

    const target = this.currentWord();
    if (!target) return;

    const isMatch = selectedWord.en === target.en;

    this.feedbackState.set({ clickedIndex: optionIdx, isCorrect: isMatch });

    if (isMatch) {
      if (!this.wasFailed()) {
        this.success.update((s) => s + 1);
      }
      setTimeout(() => {
        this.nextWord();
      }, 500);
    } else {
      if (!this.wasFailed()) {
        this.failed.update((f) => f + 1);
        this.wasFailed.set(true);
      }

      setTimeout(() => {
        if (this.feedbackState()?.clickedIndex === optionIdx && !this.feedbackState()?.isCorrect) {
          this.feedbackState.set(null);
        }
      }, 1000);
    }
  }

  private nextWord() {
    this.feedbackState.set(null);
    this.wasFailed.set(false);
    this.actualIdx.update((i) => i + 1);
    this.generateOptions();
  }

  private generateOptions() {
    const target = this.currentWord();
    const allCards = this.cards();

    if (!target || allCards.length === 0) {
      this.currentOptions.set([]);
      return;
    };

    const others = allCards.filter((c) => c !== target);
    this.wordService.shuffle(others);

    const options = [...others.slice(0, 3), target];
    this.wordService.shuffle(options);

    this.currentOptions.set(options);
  }

  restart() {
    this.cards.update((current) => {
      const reshuffled = [...current];
      this.wordService.shuffle(reshuffled);
      return reshuffled;
    });

    this.actualIdx.set(0);
    this.success.set(0);
    this.failed.set(0);
    this.wasFailed.set(false);
    this.feedbackState.set(null);
    this.generateOptions();
  }

  toggleLang() {
    this.questionLang.update((l) => (l === 'en' ? 'hu' : 'en'));
    this.restart();
  }

  speak() {
    const word = this.currentWord();
    if (word) {
      this.wordService.speakPhrase(word.en);
    }
  }

  getCardConfig(optionWord: LearnWordData, idx: number) {
    const feedback = this.feedbackState();
    let activeClass = 'bg-dark';

    if (feedback && feedback.clickedIndex === idx) {
      activeClass = feedback.isCorrect ? 'bg-success' : 'bg-danger';
    }

    return {
      value: optionWord[this.answerLang()],
      visible: true,
      speakable: false,
      activeClass: activeClass,
      lang: this.answerLang(),
    };
  }
}
