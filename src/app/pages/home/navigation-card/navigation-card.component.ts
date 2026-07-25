import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-navigation-card',
    templateUrl: './navigation-card.component.html',
    styleUrls: ['./navigation-card.component.scss'],
    imports: [TranslatePipe],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationCardComponent {
  action = input<string>();
  displayName = input<string>();
  iconClass = input<string>();
  private router = inject(Router);

  onClick() {
    this.router.navigate([this.action()]);
  }
}
