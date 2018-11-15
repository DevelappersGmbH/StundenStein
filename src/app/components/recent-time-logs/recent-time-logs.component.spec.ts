import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentTimeLogsComponent } from './recent-time-logs.component';

describe('RecentTimeLogsComponent', () => {
  let component: RecentTimeLogsComponent;
  let fixture: ComponentFixture<RecentTimeLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecentTimeLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentTimeLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
