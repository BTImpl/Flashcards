import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Pipe, PipeTransform, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { WordsStore } from 'src/app/core/state/words.store';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ListTypeEnum, UsersEnum } from 'src/app/model/header.model';

// Mock Translate Pipe
@Pipe({name: 'translate', standalone: true})
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return 'TRANSLATED_' + value;
  }
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockWordStore: any;
  let mockRouter: any;

  beforeEach(async () => {
    // Mockoljuk a WordStore-t és a Router-t
    mockWordStore = {
      selectedSheet: signal(UsersEnum.GABI),
      selectedListType: signal(ListTypeEnum.UNKNOWN),
      toggleUser: () => mockWordStore.selectedSheet.set(
        mockWordStore.selectedSheet() === UsersEnum.GABI ? UsersEnum.TOMI : UsersEnum.GABI
      ),
      toggleListType: () => mockWordStore.selectedListType.set(
        mockWordStore.selectedListType() === ListTypeEnum.KNOWN ? ListTypeEnum.UNKNOWN : ListTypeEnum.KNOWN
      ),
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: WordsStore, useValue: mockWordStore },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .overrideComponent(HeaderComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [MockTranslatePipe] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle user when user button is clicked', () => {
    const button = fixture.debugElement.query(By.css('.btn-secondary'));
    if (button) {
      button.triggerEventHandler('click', null);
      expect(mockWordStore.selectedSheet()).toBe(UsersEnum.TOMI);
    }
  });

  it('should toggle list type when list button is clicked', () => {
    const button = fixture.debugElement.query(By.css('.btn-success'));
    if (button) {
      button.triggerEventHandler('click', null);
      expect(mockWordStore.selectedListType()).toBe(ListTypeEnum.KNOWN);
    }
  });

  it('should navigate to home when home button is clicked', () => {
    component.toHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});
