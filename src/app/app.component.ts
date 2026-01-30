import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  title = 'Flashcards';

  constructor(private translate: TranslateService) {
    // Beállítod az alapértelmezett nyelvet
    translate.setDefaultLang('en');
    // Aktuálisan használt nyelv
    translate.use('en');
  }
}
