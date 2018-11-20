import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelogComponent } from './timelog.component';

describe('TimelogComponent', () => {
  let component: TimelogComponent;
  let fixture: ComponentFixture<TimelogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
