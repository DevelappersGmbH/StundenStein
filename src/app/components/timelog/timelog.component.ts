import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
  } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { DeleteWarningComponent } from '../delete-warning/delete-warning.component';
import { ErrorService } from '../../services/error/error.service';
import { FormControl } from '@angular/forms';
import { isNull, isUndefined } from 'util';
import { Issue } from '../../model/issue.interface';
import { map, startWith } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Observable } from 'rxjs';
import { Project } from '../../model/project.interface';
import { ReloadTriggerService } from '../../services/reload-trigger.service';
import { TimeLog } from '../../model/time-log.interface';
import { TrackerService } from '../../services/tracker/tracker.service';
import { User } from '../../model/user.interface';

@Component({
  selector: 'app-timelog',
  templateUrl: './timelog.component.html',
  styleUrls: ['./timelog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimeLogComponent implements OnInit, OnChanges {
  constructor(
    private dataService: DataService,
    private deleteDialog: MatDialog,
    private trackerService: TrackerService,
    private reloadTriggerService: ReloadTriggerService,
    private errorService: ErrorService
  ) {}

  logs: TimeLog[] = [];
  @Input() timeLog: TimeLog;
  @Input() timeLogs: TimeLog[] = [];
  @Input() projects: Project[] = [];
  @Input() issues: Issue[] = [];
  @Output() deleted: EventEmitter<number> = new EventEmitter<number>();

  trackedTime: Date;
  editMode = false;
  editButton = 'edit';
  loading = false;
  loadingDel = false;

  restartBlocked = false;
  trackerSpinning = false;

  issueControl = new FormControl();
  projectControl = new FormControl();
  logControl = new FormControl();
  issueOptions: Issue[] = [];
  projectOptions: Project[] = [];
  filteredIssues: Observable<Issue[]>;
  filteredProjects: Observable<Project[]>;
  filteredLogs: Observable<TimeLog[]>;

  filteredObject = false;

  ngOnChanges(changes: SimpleChanges) {
    if (typeof changes['timeLogs'] !== 'undefined') {
      const change = changes['timeLogs'];
      change.currentValue.forEach(log => {
        if (
          !isUndefined(log.comment) &&
          !isNull(log.comment) &&
          log.comment.length > 0
        ) {
          this.logs.unshift(log);
        }
      });
    }
    if (typeof changes['issues'] !== 'undefined') {
      const change = changes['issues'];
      this.issueOptions = this.issues;
    }
    if (typeof changes['projects'] !== 'undefined') {
      const change = changes['projects'];
      this.projectOptions = this.projects;
    }
  }

  ngOnInit() {
    this.trackedTime = new Date(
      this.timeLog.timeStarted.getFullYear(),
      this.timeLog.timeStarted.getMonth(),
      this.timeLog.timeStarted.getDate(),
      Math.floor(this.timeLog.timeInHours),
      (this.timeLog.timeInHours * 60) % 60,
      0,
      0
    );

    this.issueControl.setValue(
      this.timeLog.issue ? this.timeLog.issue : undefined
    );
    this.projectControl.setValue(
      this.timeLog.project ? this.timeLog.project : undefined
    );
    this.logControl.setValue(
      this.timeLog.comment ? this.timeLog.comment : undefined
    );

    this.filteredIssues = this.issueControl.valueChanges.pipe(
      startWith(''),
      map(issue =>
        issue ? this.filterIssues(issue) : this.issueOptions.slice()
      )
    );

    this.filteredProjects = this.projectControl.valueChanges.pipe(
      startWith(''),
      map(project =>
        project ? this.filterProjects(project) : this.projectOptions.slice()
      )
    );

    this.filteredLogs = this.logControl.valueChanges.pipe(
      startWith(''),
      map(log => (log ? this.filterLogs(log) : this.logs.slice()))
    );

    if (!this.timeLog.project || this.timeLog.project.name === '') {
      this.editButton = 'playlist_add';
    }

    this.trackerService.reTrackingInProgress.subscribe(inProgress => {
      if (inProgress === true) {
        this.restartBlocked = true;
      } else {
        this.restartBlocked = false;
        this.trackerSpinning = false;
      }
    });
  }

  shorten(value: string, maxLength: number, abbr: string = '…'): string {
    if (!value) {
      return '';
    }
    if (value.length > maxLength) {
      value = value.substring(0, maxLength - abbr.length) + abbr;
    }
    return value;
  }

  displayIssue = issue => {
    if (!issue) {
      return '';
    }
    return (
      issue.tracker + ' #' + issue.id.toString() + ': ' + issue.subject
    );
  }

  displayProject = project => {
    if (!project) {
      return '';
    }
    return project.name;
  }

  displayLog = log => {
    if (!log) {
      return '';
    }
    if (!log.includes('$$')) {
      return log;
    }

    return log.substring(log.indexOf('$$') + 2);
  }

  private filterIssues(value): Issue[] {
    if (!this.isString(value)) {
      value = value.subject;
    }
    const filterValue: string = value
      .toLowerCase()
      .replace('#', '')
      .trim();

    return this.issueOptions.filter(
      issue =>
        issue.subject.toLowerCase().includes(filterValue) ||
        issue.id.toString().includes(filterValue) ||
        issue.subject
          .toLowerCase()
          .includes(filterValue.substring(filterValue.lastIndexOf(': ') + 2))
    );
  }

  private filterProjects(value): Project[] {
    if (!this.isString(value)) {
      value = value.name;
      this.filteredObject = true;
    } else {
      this.filteredObject = false;
    }
    const filterValue = value
      .toLowerCase()
      .replace('#', '')
      .trim();

    return this.projectOptions.filter(project =>
      project.name.toLowerCase().includes(filterValue)
    );
  }

  private filterLogs(value): TimeLog[] {
    if (!this.isString(value)) {
      value = value.comment;
    }
    const filterValue: string = value
      .toLowerCase()
      .replace('#', '')
      .trim();
    return this.logs.filter(
      log =>
        !isUndefined(log.comment) &&
        !isNull(log.comment) &&
        !isUndefined(log.comment) &&
        !isNull(log.comment) &&
        log.comment.length > 0 &&
        filterValue.length > 0 &&
        log.comment.toLowerCase().includes(filterValue)
    );
  }

  private isString(value): boolean {
    return Object.prototype.toString.call(value) === '[object String]';
  }

  updateIssueOptions(project) {
    this.issueOptions = [];
    this.issues.forEach(issue => {
      if (issue.project.id === project.id) {
        this.issueOptions.push(issue);
      }
    });
  }

  selectIssue(issue) {
    if (this.findIssue(issue)) {
      this.timeLog.issue = issue;
      this.timeLog.project = issue.project;

      this.issueControl.setValue(
        this.timeLog.issue ? this.timeLog.issue : undefined
      );
      this.updateIssueOptions(this.timeLog.project);

      this.projectControl.setValue(
        this.timeLog.project ? this.timeLog.project : undefined
      );
    } else {
      if (this.timeLog.project && this.timeLog.issue) {
        this.updateIssueOptions(this.timeLog.project);
      } else if (this.timeLog.issue) {
        this.projectControl.setValue(undefined);
      }
      this.projectOptions = this.projects;
      this.timeLog.issue = null;
    }
  }

  selectProject(project) {
    if (this.findProject(project)) {
      this.timeLog.project = project;
      this.projectControl.setValue(project ? project : undefined);
      this.updateIssueOptions(project);
      this.issueControl.setValue(undefined);
      this.timeLog.issue = null;
    } else {
      this.issueOptions = this.issues;
      this.projectOptions = this.projects;
      this.timeLog.issue = null;
      this.timeLog.project = null;
      this.issueControl.setValue(
        this.timeLog.issue ? this.timeLog.issue : undefined
      );
    }
  }

  selectLog(logData: string) {
    if (logData === null || logData.length < 1 || !logData.includes('$$')) {
      this.timeLog.comment = '';
      return;
    }
    const logId = Number.parseInt(
      logData.substring(0, logData.indexOf('$$')),
      10
    );
    const log = this.logs.find(tlog => tlog.id === logId);
    this.timeLog.comment = log.comment;
    if (!log.project) {
      this.timeLog.project = undefined;
      this.projectControl.setValue(undefined);
      this.timeLog.issue = undefined;
      this.issueControl.setValue(undefined);
      return;
    }
    if (!log.issue) {
      this.selectProject(log.project);
      this.projectControl.setValue(this.timeLog.project);
    } else {
      this.selectIssue(log.issue);
      this.issueControl.setValue(this.timeLog.issue);
    }
  }

  startTracker() {
    this.trackerSpinning = true;
    this.trackerService.track({
      project: this.timeLog.project,
      issue: this.timeLog.issue,
      comment: this.timeLog.comment,
      billable: true
    });
  }

  markBillable() {
    this.timeLog.billable = !this.timeLog.billable;
  }

  changeEndTime(time) {
    const hours = parseInt(time.split(':')[0], 10);
    const mins = parseInt(time.split(':')[1], 10);
    if (!isNaN(hours) && !isNaN(mins)) {
      this.timeLog.timeStopped = new Date(
        this.timeLog.timeStarted.getFullYear(),
        this.timeLog.timeStarted.getMonth(),
        this.timeLog.timeStarted.getDate(),
        hours,
        mins,
        0,
        0
      );
    }
    this.calculateTime();
  }

  changeStartTime(time) {
    const hours = parseInt(time.split(':')[0], 10);
    const mins = parseInt(time.split(':')[1], 10);
    if (!isNaN(hours) && !isNaN(mins)) {
      this.timeLog.timeStarted = new Date(
        this.timeLog.timeStarted.getFullYear(),
        this.timeLog.timeStarted.getMonth(),
        this.timeLog.timeStarted.getDate(),
        hours,
        mins,
        0,
        0
      );
    }
    this.calculateTime();
  }

  private calculateTime() {
    const seconds =
      (<any>this.timeLog.timeStopped - <any>this.timeLog.timeStarted) / 1000;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds - hours * 3600) / 60);
    const secs = seconds - hours * 3600 - mins * 60;

    this.trackedTime = new Date(1, 1, 1, hours, mins, secs, 0);
  }

  private isBooked() {
    if (!this.timeLog.project || this.timeLog.project.name === '') {
      this.timeLog.booked = false;
    } else {
      this.timeLog.booked = true;
    }
  }

  changeMode() {
    if (this.editMode === false) {
      /*change button to "accept", everything editable*/
      this.editButton = 'done';
    } else {
      this.isBooked();
      if (this.timeLog.booked === false) {
        /*change button to "ACHTUNG!", issue, comment, project, billable, end/start time uneditable*/
        this.editButton = 'playlist_add';
      } else {
        /* change button to "edit", issue, comment, project, billable, end/start time uneditable*/
        this.editButton = 'edit';
      }
      this.updateTimeLog();
    }
    this.editMode = !this.editMode;
  }

  private findProject(project): Project {
    if (project) {
      return this.projectOptions.find(entry => entry.id === project.id);
    }
    return undefined;
  }

  private findIssue(issue): Issue {
    if (issue) {
      return this.issueOptions.find(entry => entry.id === issue.id);
    }
    return undefined;
  }

  showDeleteWarning() {
    this.loadingDel = true;
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.deleteDialog.open(
      DeleteWarningComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.deleteTimeLog();
      }
      this.loadingDel = false;
    });
  }

  deleteTimeLog() {
    const that = this;
    this.dataService.deleteTimeLog(this.timeLog).subscribe({
      next() {
        that.reloadTriggerService.triggerTimeLogDeleted(that.timeLog.id);
      },
      error() {
        this.errorService.errorDialog('Could not delete this timeLog :(');
      }
    });
  }

  updateTimeLog() {
    const that = this;
    that.loading = true;
    this.dataService.updateTimeLog(this.timeLog).subscribe({
      next() {
        that.loading = false;
        that.reloadTriggerService.triggerTimeLogUpdated(that.timeLog);
      },
      error() {
        this.errorService.errorDialog('Could not update this timeLog :(');
        that.loading = false;
      }
    });
  }
}
