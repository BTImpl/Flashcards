import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskWordsComponent } from './ask-words.component';

describe('AskWordsComponent', () => {
  let component: AskWordsComponent;
  let fixture: ComponentFixture<AskWordsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AskWordsComponent]
    });
    fixture = TestBed.createComponent(AskWordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
