import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { WordCardModel } from './word-card.model';
import { WordService } from 'src/app/services/words.service';
import { FitTextDirective } from 'src/app/directives/fit-text.directive';

@Component({
    selector: 'app-word-card',
    templateUrl: './word-card.component.html',
    styleUrls: ['./word-card.component.scss'],
    imports: [FitTextDirective],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'd-block h-100' },
})
export class WordCardComponent {
  word = input.required<WordCardModel>();
  maxFontSize = input(40);
  minFontSize = input(13);
  cardClicked = output<void>();

   private wordService = inject(WordService);

  wordClicked() {
    this.cardClicked.emit();
  }

  speak(event: Event){
    this.wordService.speakPhrase(this.word().value);
    event.stopPropagation();
  }
}
