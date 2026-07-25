import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { WordService } from 'src/app/services/words.service';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NavigationFooterComponent } from "src/app/components/navigation-footer/navigation-footer.component";
import { LoadingStateComponent } from 'src/app/components/loading-state/loading-state.component';
import { WordsStore } from 'src/app/core/state/words.store';
import { createShuffledWordList } from 'src/app/utils/shuffled-word-list';

@Component({
    selector: 'app-ask-words',
    templateUrl: './ask-words.component.html',
    styleUrls: ['./ask-words.component.scss'],
    imports: [FormsModule, TranslatePipe, NavigationFooterComponent, LoadingStateComponent],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'd-flex flex-column flex-fill h-100' },
})
export class AskWordsComponent {
  private wordService = inject(WordService);
  private wordStore = inject(WordsStore);

  private nav = createShuffledWordList(this.wordStore.words, (words) => this.wordService.shuffle(words));

  shuffledWords = this.nav.shuffledWords;
  actualIdx = this.nav.actualIdx;
  actualWord = this.nav.actualWord;
  step = this.nav.step;

  helpDisplayed = signal(false);
  isActualFailed = signal(false);
  answer = signal('');

  check(){
    if (this.answer().toLowerCase() === this.actualWord()?.en.toLowerCase()){
      this.isActualFailed.set(false);
      this.step(1);
    } else {
      this.isActualFailed.set(true);
    }
    this.answer.set('');
  }

  help(){
    this.helpDisplayed.set(true);
    setTimeout(() => {
      this.helpDisplayed.set(false);
    }, 2000);
  }
}
