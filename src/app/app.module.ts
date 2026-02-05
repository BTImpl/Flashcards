import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WordCardComponent } from './components/word-card/word-card.component';
import { FlashcardsComponent } from './pages/flashcards/flashcards.component';
import { HeaderComponent } from './components/header/header.component';
import { PairingComponent } from './pages/pairing/pairing.component';
import { LearnWordsComponent } from './pages/learn-words/learn-words.component';
import { AskWordsComponent } from './pages/ask-words/ask-words.component';
import { HomeComponent } from './pages/home/home.component';
import { NavigationCardComponent } from './pages/home/navigation-card/navigation-card.component';
import { I18nModule } from './i18n.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    FlashcardsComponent,
    HeaderComponent,
    PairingComponent,
    LearnWordsComponent,
    AskWordsComponent,
    HomeComponent,
    NavigationCardComponent,
    WordCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    I18nModule,
    FormsModule

],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
