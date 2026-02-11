import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationCardComponent } from './navigation-card/navigation-card.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    imports: [NavigationCardComponent]
})
export class HomeComponent {



}
