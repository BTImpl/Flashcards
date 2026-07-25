import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-navigation-footer',
  imports: [ TranslatePipe],
  templateUrl: './navigation-footer.component.html',
  styleUrls: ['./navigation-footer.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationFooterComponent {
  backDisabled = input(false);
  nextDisabled = input(false);
  backClicked = output<void>();
  nextClicked = output<void>();

  back() {
    this.backClicked.emit();
  }

  next() {
    this.nextClicked.emit();
  }
}
