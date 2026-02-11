import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WordService } from './services/words.service';
import { Word, Words } from './model/words.model';
import { HeaderComponent } from './components/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [HeaderComponent, RouterOutlet]
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
