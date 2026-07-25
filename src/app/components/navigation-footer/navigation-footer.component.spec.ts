import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationFooterComponent } from './navigation-footer.component';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

// Mock Translate Pipe
@Pipe({name: 'translate', standalone: true})
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return 'TRANSLATED_' + value;
  }
}

describe('NavigationFooterComponent', () => {
  let component: NavigationFooterComponent;
  let fixture: ComponentFixture<NavigationFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationFooterComponent]
    })
    // Felülírjuk a TranslatePipe-ot a Mock-ra
    .overrideComponent(NavigationFooterComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [MockTranslatePipe] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit backClicked when back() is called', () => {
    spyOn(component.backClicked, 'emit');

    component.back();

    expect(component.backClicked.emit).toHaveBeenCalled();
  });

  it('should emit nextClicked when next() is called', () => {
    spyOn(component.nextClicked, 'emit');

    component.next();

    expect(component.nextClicked.emit).toHaveBeenCalled();
  });
});
