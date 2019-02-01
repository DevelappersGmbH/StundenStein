import { UserServiceMock } from './../../services/mocked-services/UserServiceMock.spec';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatAutocompleteModule, MatDialog } from '@angular/material';
import { DataService } from 'src/app/services/data/data.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTrackerComponent } from './time-tracker.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { DataServiceMock } from 'src/app/services/mocked-services/DataServiceMock.spec';
import { Favicons } from 'src/app/services/favicon/favicon.service';
import { ErrorService } from 'src/app/services/error/error.service';
import { Issue } from 'src/app/model/issue.interface';
import { TimeLog } from 'src/app/model/time-log.interface';

describe('TimeTrackerComponent', () => {
  let component: TimeTrackerComponent;
  let fixture: ComponentFixture<TimeTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatAutocompleteModule ],
      declarations: [ TimeTrackerComponent ],
      providers: [{provide : DataService, useClass: DataServiceMock}, {provide: UserService, useClass: UserServiceMock},
        {provide: Favicons, useClass: Favicons}, {provide: ErrorService, useClass: ErrorService}, {provide: MatDialog, useValue: {}}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('makeLogComparisonString should return correct comparison string', () => {
    const log: TimeLog = {
      id: 12, 
      project: undefined,
      timeStarted: undefined,
      timeStopped: undefined,
      comment: 'COMMENT',
      timeInHours: undefined,
      booked: undefined,
      hourGlassTimeBookingId: undefined,
      redmineTimeEntryId: undefined,
      billable: undefined,
      issue: undefined,
      user: {
        id: 0,
        name: 'Thomas'
      }
    }
    expect(component.makeLogComparisonString(log)).toBe(log.comment + '||');
    log.project = {
      id: 5,
      name: 'PROJECTNAME',
      color: 'red'
    }
    expect(component.makeLogComparisonString(log)).toBe(log.comment + '||' + log.project.id.toString());
    log.issue = {
      id: 12,
      subject: 'ISSUESUBJECT',
      tracker: undefined,
      project: undefined,
      assignedTo: undefined
    }
    expect(component.makeLogComparisonString(log)).toBe(log.comment + '|' + log.issue.id.toString() + '|' + log.project.id.toString());
  });

  it('should detect if two dates are on the same day', () => {
    expect(component.sameday(new Date("2018-01-01 13:24"), new Date("2018-01-01 23:59"))).toBe(true);
    expect(component.sameday(new Date("2018-01-02 00:01"), new Date("2018-01-01 23:59"))).toBe(false);
    expect(component.sameday(new Date("2018-01-02 00:01"), new Date("2010-01-02 00:01"))).toBe(false);
    expect(component.sameday(new Date("2018-01-02 00:01"), new Date("2018-10-02 00:01"))).toBe(false);
    expect(component.sameday(new Date("2018-01-02 00:01"), new Date("2018-01-20 00:01"))).toBe(false);
  });
  
  /*it('should set billable to false after click and true after second click', () => {
    component.timeTracker.billable = true;
    fixture.detectChanges();
    fixture.debugElement.nativeElement.querySelector('button[name="billable"]').click();
    fixture.detectChanges();
    expect(component.timeTracker.billable).toBeFalsy();
    fixture.debugElement.nativeElement.querySelector('button[name="billable"]').click();
    fixture.detectChanges();
    expect(component.timeTracker.billable).toBeTruthy();
  });*/

  // POSSIBLY FAILS WHEN RUNNING TETS IN RANDOM ORDER!
  it('loads the running time tracker correctly', () => {
    component.timeTracker = {};
    component.loadTimeTracker();
    expect(JSON.stringify(component.timeTracker)).toBe(JSON.stringify({
      id: 13,
      timeStarted: undefined,
      billable: false,
      project: {
        id: 2,
        name: 'TestProject',
        color: 'Red'
      },
      issue: undefined,
      comment: 'example comment'
    }));
  });

  // POSSIBLY FAILS WHEN RUNNING TETS IN RANDOM ORDER!
  it('to stop the running tracker', () => {
    component.loadTimeTracker();
    component.stopTimeTracker();
    expect(JSON.stringify(component.timeTracker)).toBe(JSON.stringify({
      billable: true,
      comment: '',
      issue: null,
      project: null
    }));
  });

});
