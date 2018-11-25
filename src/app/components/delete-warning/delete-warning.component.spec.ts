import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteWarningComponent } from './delete-warning.component';

describe('DeleteWarningComponent', () => {
  let component: DeleteWarningComponent;
  let fixture: ComponentFixture<DeleteWarningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteWarningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
