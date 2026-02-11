import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnWordsComponent } from './learn-words.component';

describe('LearnWordsComponent', () => {
  let component: LearnWordsComponent;
  let fixture: ComponentFixture<LearnWordsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [LearnWordsComponent]
});
    fixture = TestBed.createComponent(LearnWordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
