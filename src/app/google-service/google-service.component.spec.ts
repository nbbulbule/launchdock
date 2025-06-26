import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleServiceComponent } from './google-service.component';

describe('GoogleServiceComponent', () => {
  let component: GoogleServiceComponent;
  let fixture: ComponentFixture<GoogleServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleServiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoogleServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
