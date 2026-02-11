import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-navigation-card',
    templateUrl: './navigation-card.component.html',
    styleUrls: ['./navigation-card.component.css'],
    imports: [TranslatePipe]
})
export class NavigationCardComponent {
  @Input() action: string = '';
  @Input() displayName: string = '';
  @Input() iconClass: string = '';

  constructor(private router: Router) { }

  onClick() {
    this.router.navigate([this.action]);
  }
}
