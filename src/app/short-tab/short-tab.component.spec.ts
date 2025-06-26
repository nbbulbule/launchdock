import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortTabComponent } from './short-tab.component';

describe('ShortTabComponent', () => {
  let component: ShortTabComponent;
  let fixture: ComponentFixture<ShortTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShortTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
