import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderComponent } from './components/header/header.component';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { take } from 'rxjs';
import { WordsStore } from './core/state/words.store';
import { ListTypeEnum, UsersEnum } from './model/header.model';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, RouterOutlet],
})
export class AppComponent {
  title = 'Flashcards';

  private route = inject(ActivatedRoute);
  private wordStore = inject(WordsStore);

  constructor() {
    this.route.queryParamMap.pipe(take(1), takeUntilDestroyed()).subscribe((params) => {
      const user = params.get('user');
      const list = params.get('list');

      const matchedUser = Object.values(UsersEnum).find((u) => u.toLowerCase() === user?.toLowerCase());
      if (matchedUser) {
        this.wordStore.setSheet(matchedUser);
      }

      const matchedList = Object.values(ListTypeEnum).find((l) => l.toLowerCase() === list?.toLowerCase());
      if (matchedList) {
        this.wordStore.setListType(matchedList);
      }
    });
  }
}
