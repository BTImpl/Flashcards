import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

// Mock Translate Pipe
@Pipe({name: 'translate', standalone: true})
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return 'TRANSLATED_' + value;
  }
}


describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [HomeComponent]
})// 2. A LÉNYEG: Felülírjuk a TranslatePipe-ot a Mock verzióra
    .overrideComponent(HomeComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [MockTranslatePipe] }
    })
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
