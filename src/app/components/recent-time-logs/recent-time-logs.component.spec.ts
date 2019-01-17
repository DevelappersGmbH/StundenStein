import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RecentTimeLogsComponent } from './recent-time-logs.component';
import { UserServiceMock } from '../../services/mocked-services/UserServiceMock.spec';
import { DataServiceMock } from '../../services/mocked-services/DataServiceMock.spec';
import { UserService } from 'src/app/services/user/user.service';
import { DataService } from 'src/app/services/data/data.service';
import {
  MatBadgeModule,
  MatListModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const mockUser = {
  name: 'TestUser',
  id: 99
};

const mockProject = {
  id: 2,
  name: 'TestProject',
  color: 'Red'
};

const mockIssue = {
  id: 3,
  subject: 'TestIssue',
  tracker: 'TestTracker',
  project: mockProject,
  assignedTo: mockUser
};

const mockTimeLog1 = {
  id: 1,
  timeStarted: new Date('October 1, 2018 11:00:00'),
  timeStopped: new Date('October 1, 2018 16:00:00'),
  comment: 'Testcomment 1',
  timeInHours: 5,
  booked: true,
  hourGlassTimeBookingId: 1,
  redmineTimeEntryId: 1,
  billable: true,
  issue: mockIssue,
  project: mockProject,
  user: mockUser
};

const mockTimeLog2 = {
  id: 1,
  timeStarted: new Date('October 1, 2018 11:00:00'),
  timeStopped: new Date('October 1, 2018 16:00:00'),
  comment: 'Testcomment 1',
  timeInHours: 5,
  booked: false,
  hourGlassTimeBookingId: 1,
  redmineTimeEntryId: 1,
  billable: true,
  issue: mockIssue,
  project: mockProject,
  user: mockUser
};

const mockTimeLog3 = {
  id: 1,
  timeStarted: new Date('October 4, 2018 11:00:00'),
  timeStopped: new Date('October 4, 2018 16:00:00'),
  comment: 'Testcomment 1',
  timeInHours: 5,
  booked: true,
  hourGlassTimeBookingId: 1,
  redmineTimeEntryId: 1,
  billable: true,
  issue: mockIssue,
  project: mockProject,
  user: mockUser
};

const mockTimeLog4 = {
  id: 1,
  timeStarted: new Date('October 5, 2018 11:00:00'),
  timeStopped: new Date('October 5, 2018 16:00:00'),
  comment: 'Testcomment 1',
  timeInHours: 5,
  booked: false,
  hourGlassTimeBookingId: 1,
  redmineTimeEntryId: 1,
  billable: true,
  issue: mockIssue,
  project: mockProject,
  user: mockUser
};

describe('RecentTimeLogsComponent', () => {
  let component: RecentTimeLogsComponent;
  let fixture: ComponentFixture<RecentTimeLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatProgressSpinnerModule, MatBadgeModule, MatListModule],
      declarations: [RecentTimeLogsComponent],
      providers: [
        { provide: UserService, useClass: UserServiceMock },
        { provide: DataService, useClass: DataServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentTimeLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should compare dates correctly', () => {
    let d1 = new Date('December 17, 2018 03: 24: 00');
    let d2 = new Date('December 17, 2018 03: 24: 00');
    expect(component.compareDatesEqual(d1, d2)).toBeTruthy();
    d2 = new Date('December 18, 2018 03: 24: 00');
    expect(component.compareDatesEqual(d1, d2)).toBeFalsy();
    d1 = new Date('December 17, 2018 03: 24: 00');
    d2 = new Date('December 17, 2018 06: 49: 01');
    component.ngOnInit();
    expect(component.compareDatesEqual(d1, d2)).toBeTruthy();
  });

  it('should count number of unbookedTimeLogs correctly', () => {
    const timeLogMap = new Map();
    timeLogMap.set(new Date('October 1, 2018 03: 24: 00'), [
      mockTimeLog1,
      mockTimeLog2
    ]);
    timeLogMap.set(new Date('October 4, 2018 03: 24: 00'), [mockTimeLog3]);
    timeLogMap.set(new Date('October 5, 2018 03: 24: 00'), [mockTimeLog4]);
    const unbookedTimeLogsMap = new Map();
    unbookedTimeLogsMap.set(new Date('October 1, 2018 03: 24: 00'), 1);
    unbookedTimeLogsMap.set(new Date('October 4, 2018 03: 24: 00'), 0);
    unbookedTimeLogsMap.set(new Date('October 5, 2018 03: 24: 00'), 1);
    component.ngOnInit();
    component.timeLogMap = timeLogMap;
    component.countUnbookedTimeLogs();
    expect(component.numberOfUnbookedTimeLogs).toBe(2);
    expect(component.unbookedTimeLogsMap.keys()).toEqual(unbookedTimeLogsMap.keys());
    unbookedTimeLogsMap.forEach((n: number, d: Date) => {
        expect(component.unbookedTimeLogsMap.get(d)).toEqual(unbookedTimeLogsMap.get(d));
    });
    // expect(component.unbookedTimeLogsMap).toEqual(unbookedTimeLogsMap);
  });
});
