import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeLogComponent } from './timelog.component';

describe('TimeLogComponent', () => {
  let component: TimeLogComponent;
  let fixture: ComponentFixture<TimeLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TimeLogComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
