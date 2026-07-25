import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { createSimpleWord } from 'src/app/components/word-card/word-card.model';
import { WordService } from 'src/app/services/words.service';
import { WordCardComponent } from '../../components/word-card/word-card.component';
import { NavigationFooterComponent } from 'src/app/components/navigation-footer/navigation-footer.component';
import { LoadingStateComponent } from 'src/app/components/loading-state/loading-state.component';
import { WordsStore } from 'src/app/core/state/words.store';
import { TranslatePipe } from '@ngx-translate/core';
import { createShuffledWordList } from 'src/app/utils/shuffled-word-list';

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.scss'],
  imports: [WordCardComponent, NavigationFooterComponent, LoadingStateComponent, TranslatePipe],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-flex flex-column flex-fill h-100' },
})
export class FlashcardsComponent {
  private wordService = inject(WordService);
  private wordStore = inject(WordsStore);

  isFlipped = signal(false);

  private nav = createShuffledWordList(
    this.wordStore.words,
    (words) => this.wordService.shuffle(words),
    () => this.isFlipped.set(false),
  );

  shuffledWords = this.nav.shuffledWords;
  actualWordIdx = this.nav.actualIdx;
  actualWord = this.nav.actualWord;

  enWord = computed(() => {
    const word = this.actualWord();
    return word ? createSimpleWord(word.en, true) : undefined;
  });

  huWord = computed(() => {
    const word = this.actualWord();
    return word ? createSimpleWord(word.hu, false) : undefined;
  });

  actual = computed(() => (this.isFlipped() ? this.huWord() : this.enWord()));

  step(direction: number) {
    const previousIdx = this.actualWordIdx();
    this.nav.step(direction);
    if (this.actualWordIdx() !== previousIdx) {
      this.isFlipped.set(false);
    }
  }

  flip() {
    this.isFlipped.update((flipped) => !flipped);
  }
}
