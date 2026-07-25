import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashcardsComponent } from './flashcards.component';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

// Mock Translate Pipe
@Pipe({name: 'translate', standalone: true})
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return 'TRANSLATED_' + value;
  }
}


describe('FlashcardsComponent', () => {
  let component: FlashcardsComponent;
  let fixture: ComponentFixture<FlashcardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [FlashcardsComponent]
})
    .overrideComponent(FlashcardsComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [MockTranslatePipe] }
    })
    .compileComponents();
    fixture = TestBed.createComponent(FlashcardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
