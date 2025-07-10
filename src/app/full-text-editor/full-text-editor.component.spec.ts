import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullTextEditorComponent } from './full-text-editor.component';

describe('FullTextEditorComponent', () => {
  let component: FullTextEditorComponent;
  let fixture: ComponentFixture<FullTextEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullTextEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullTextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
