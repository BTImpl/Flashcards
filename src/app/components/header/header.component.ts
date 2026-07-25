import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LIST_TYPES } from 'src/app/model/header.model';
import { TranslatePipe } from '@ngx-translate/core';
import { WordsStore } from 'src/app/core/state/words.store';

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslatePipe]
})
export class HeaderComponent {
  private router = inject(Router);
  wordStore = inject(WordsStore);

  readonly currentListConfig = computed(() => LIST_TYPES[this.wordStore.selectedListType()]);

  toHome(){
    this.router.navigate(['/']);
  }

  changeList(){
    this.wordStore.toggleListType();
  }

  changeUser(){
    this.wordStore.toggleUser();
  }
}
