import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WordCardComponent } from './word-card.component';
import { WordService } from 'src/app/services/words.service';
import { createSimpleWord } from './word-card.model';

describe('WordCardComponent', () => {
  let component: WordCardComponent;
  let fixture: ComponentFixture<WordCardComponent>;
  let mockWordService: any;

  beforeEach(async () => {
    // Mockoljuk a WordService-t
    mockWordService = {
      speakPhrase: jasmine.createSpy('speakPhrase')
    };

    await TestBed.configureTestingModule({
      imports: [WordCardComponent],
      providers: [
        { provide: WordService, useValue: mockWordService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordCardComponent);
    component = fixture.componentInstance;

    // Kötelező Input beállítása
    fixture.componentRef.setInput('word', createSimpleWord('apple', true));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cardClicked when wordClicked is called', () => {
    spyOn(component.cardClicked, 'emit');
    component.wordClicked();
    expect(component.cardClicked.emit).toHaveBeenCalled();
  });

  it('should call speakPhrase when speak is called', () => {
    const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
    component.speak(mockEvent);

    expect(mockWordService.speakPhrase).toHaveBeenCalledWith('apple');
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});
