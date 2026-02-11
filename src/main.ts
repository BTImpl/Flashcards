import { provideZoneChangeDetection, importProvidersFrom } from "@angular/core";
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { AppRoutingModule } from "./app/app-routing.module";
import { I18nModule } from "./app/i18n.module";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app/app.component";


bootstrapApplication(AppComponent, {
    providers: [importProvidersFrom(BrowserModule, AppRoutingModule, I18nModule, FormsModule)]
})
  .catch(err => console.error(err));
