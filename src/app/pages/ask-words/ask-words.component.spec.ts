import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskWordsComponent } from './ask-words.component';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

// Mock Translate Pipe
@Pipe({name: 'translate', standalone: true})
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return 'TRANSLATED_' + value;
  }
}


describe('AskWordsComponent', () => {
  let component: AskWordsComponent;
  let fixture: ComponentFixture<AskWordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskWordsComponent]
    })// 2. A LÉNYEG: Felülírjuk a TranslatePipe-ot a Mock verzióra
    .overrideComponent(AskWordsComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [MockTranslatePipe] }
    })
    .compileComponents();
    fixture = TestBed.createComponent(AskWordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
