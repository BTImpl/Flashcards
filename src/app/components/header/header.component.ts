import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderModel, KnownUnknownEnum, UsersEnum } from 'src/app/model/header.model';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: false
})
export class HeaderComponent {
  private router = inject(Router);

  model: HeaderModel = {
    user: UsersEnum.GABI,
    list: KnownUnknownEnum.KNOWN
  };

  toHome(){
    this.router.navigate(['/']);
  }

  changeList(){
    if(this.model.list === KnownUnknownEnum.KNOWN){
      this.model.list = KnownUnknownEnum.UNKNOWN;
    } else {
      this.model.list = KnownUnknownEnum.KNOWN;
    }
  }

  chanegeUser(){
    if(this.model.user === UsersEnum.GABI){
      this.model.user = UsersEnum.TOMI;
    } else {
      this.model.user = UsersEnum.GABI;
    }
  }
}
