import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation-card',
  templateUrl: './navigation-card.component.html',
  styleUrls: ['./navigation-card.component.css']
})
export class NavigationCardComponent {
  @Input() action: string = '';

  constructor(private router: Router) { }

  onClick() {
    this.router.navigate([this.action]);
  }
}
