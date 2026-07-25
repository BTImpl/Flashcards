import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationCardComponent } from './navigation-card/navigation-card.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    imports: [NavigationCardComponent],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
