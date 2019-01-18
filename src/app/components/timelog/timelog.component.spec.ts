import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeLogComponent } from './timelog.component';
import {Project} from '../../model/project.interface';
import {MatAutocompleteModule, MatDialog, MatDialogModule} from '@angular/material';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {DeleteWarningComponent} from '../delete-warning/delete-warning.component';
import {detectChanges} from '@angular/core/src/render3';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {DatePipe} from '@angular/common';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {User} from '../../model/user.interface';
import {Issue} from '../../model/issue.interface';
import {TimeLog} from '../../model/time-log.interface';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';

describe('TimeLogComponent', () => {
  let dialog: MatDialog;
  let component: TimeLogComponent;
  let fixture: ComponentFixture<TimeLogComponent>;
  const user: User = {
    name: 'TestUser',
    id: 99
  };
  const project: Project = {
    id: 1,
    name: 'prototypeProject',
    color: 'blue'
  };

  const issue: Issue = {
    id: 3,
    subject: 'TestIssue',
    tracker: 'TestTracker',
    project: project,
    assignedTo: user
  };

  const timeLog: TimeLog = {
    id: 1,
    timeStarted: new Date('October 1, 2018 11:00:00'),
    timeStopped: new Date('October 1, 2018 16:00:00'),
    comment: 'Testcomment 1',
    timeInHours: 5,
    booked: true,
    hourGlassTimeBookingId: 1,
    redmineTimeEntryId: 1,
    billable: true,
    issue: issue,
    project: project,
    user: user
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeLogComponent, DeleteWarningComponent ],
      imports: [FormsModule,
        MatAutocompleteModule,
        MatDialogModule,
        ReactiveFormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        NoopAnimationsModule],
      providers: [
        CookieService,
        DatePipe
      ],
      schemas: [ NO_ERRORS_SCHEMA]
    })
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [DeleteWarningComponent]
      }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    dialog = TestBed.get(MatDialog);
    fixture = TestBed.createComponent(TimeLogComponent);
    component = fixture.componentInstance;
    component.timeLog = timeLog;
    fixture.detectChanges();
    component.projectControl.setValue(undefined);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set edit button icon to edit when project set and to playlist_add when not', () => {
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    component.timeLog.project = undefined;
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    expect(component.editButton).toMatch('playlist_add');
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    component.timeLog.project = project;
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    expect(component.editButton).toMatch('edit');
  });

  it('should set booked to true when project set and vice versa', () => {
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    component.timeLog.project = undefined;
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    expect(component.timeLog.booked).toBeFalsy();
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    component.timeLog.project = project;
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    expect(component.timeLog.booked).toBeTruthy();
  });

  it('tracked time should be updated if edit button clicked', () => {
    spyOn(component, 'calculateTime');
    component.ngOnInit();
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    component.timeLog.project = project;
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    expect(component.calculateTime).toHaveBeenCalled();
  });

  it('updates should be sent via data service if edit button clicked', () => {
    spyOn(component, 'updateTimeLog');
    component.ngOnInit();
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    component.timeLog.project = project;
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    expect(component.updateTimeLog).toHaveBeenCalled();
  });

  it('should show warning when delete button clicked', () => {
    spyOn(component, 'showDeleteWarning');
    component.ngOnInit();
    fixture.debugElement.nativeElement.querySelector('#btnDel').click();
    expect(component.showDeleteWarning).toHaveBeenCalled();
  });

  it('should do nothing when delete warning rejected and delete when accepted', () => {
    const dialogRef = dialog.open(DeleteWarningComponent);
    spyOn(component, 'deleteTimeLog');
    fixture.detectChanges();
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        expect(component.deleteTimeLog).toHaveBeenCalled();
      } else {
        // do nothing
      }
    });
    dialogRef.close();
  });

});
