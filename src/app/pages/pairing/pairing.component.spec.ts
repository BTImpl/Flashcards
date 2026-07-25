import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PairingComponent } from './pairing.component';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

// Mock Translate Pipe
@Pipe({name: 'translate', standalone: true})
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return 'TRANSLATED_' + value;
  }
}


describe('PairingComponent', () => {
  let component: PairingComponent;
  let fixture: ComponentFixture<PairingComponent>;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
    imports: [PairingComponent]
})// 2. A LÉNYEG: Felülírjuk a TranslatePipe-ot a Mock verzióra
    .overrideComponent(PairingComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [MockTranslatePipe] }
    })
    .compileComponents();
    fixture = TestBed.createComponent(PairingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
