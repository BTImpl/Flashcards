import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { RouterOutlet } from '@angular/router';
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

  private wordStore = inject(WordsStore);

  constructor() {
    const params = new URLSearchParams(window.location.search);
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
  }
}
