import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FlashcardsComponent } from './pages/flashcards/flashcards.component';
import { PairingComponent } from './pages/pairing/pairing.component';
import { LearnWordsComponent } from './pages/learn-words/learn-words.component';
import { AskWordsComponent } from './pages/ask-words/ask-words.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'flashcards', component: FlashcardsComponent },
  { path: 'pairing', component: PairingComponent },
  { path: 'learn-words', component: LearnWordsComponent },
  { path: 'ask-words', component: AskWordsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
