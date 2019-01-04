import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
  } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { ErrorService } from 'src/app/services/error/error.service';
import { Favicons } from 'src/app/services/favicon/favicon.service';
import { forkJoin, interval, Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { isNull, isUndefined } from 'util';
import { Issue } from 'src/app/model/issue.interface';
import { map, startWith } from 'rxjs/operators';
import { Project } from 'src/app/model/project.interface';
import { ReloadTriggerService } from 'src/app/services/reload-trigger.service';
import { TimeLog } from 'src/app/model/time-log.interface';
import { TimeTracker } from 'src/app/model/time-tracker.interface';
import { Title } from '@angular/platform-browser';
import { TrackerService } from 'src/app/services/tracker/tracker.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss']
})
export class TimeTrackerComponent implements OnInit, OnChanges {
  constructor(
    private dataService: DataService,
    private userService: UserService,
    private titleService: Title,
    private faviconService: Favicons,
    private reloadTriggerSerivce: ReloadTriggerService,
    private errorService: ErrorService,
    private trackerService: TrackerService
  ) {}

  logs: TimeLog[] = [];
  @Input() timeLogs: TimeLog[] = [];
  @Input() projects: Project[] = [];
  @Input() issues: Issue[] = [];
  currentTrackerTimeString: string;
  automaticMode: boolean;
  automaticLock: boolean;
  timeTracker: Partial<TimeTracker> = {
    billable: true,
    comment: '',
    issue: null,
    project: null
  };
  issueCtrl = new FormControl();
  projectCtrl = new FormControl();
  logCtrl = new FormControl();
  filteredIssues: Observable<Issue[]>;
  filteredProjects: Observable<Project[]>;
  filteredLogs: Observable<TimeLog[]>;
  filteredObject = false;
  stoppingBlockedByNegativeTime = true;
  startingBlockedByLoading = false;
  stoppingBlockedByLoading = false;

  favIconRunning = false;

  ngOnChanges(changes: SimpleChanges): void {
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
  }

  ngOnInit() {
    this.trackerService.reTrackingInProgress.subscribe(isTracking => {
      this.stoppingBlockedByLoading = isTracking;
    });
    this.trackerService.trackerModified.subscribe(newTracker => {
      this.timeTracker = newTracker;
      this.ensureSelectedIssueIsFromIssueList();
      this.ensureSelectedProjectIsFromProjectList();
      this.updateAutoCompletes();
      this.stoppingBlockedByLoading = false;
    });
    interval(1000).subscribe(val => {
      if (!isUndefined(this.timeTracker.timeStarted)) {
        this.setTimeString(
          (new Date().valueOf() -
            new Date(this.timeTracker.timeStarted).valueOf()) /
            1000
        );
        if (!this.favIconRunning) {
          this.faviconService.activate('running');
          this.favIconRunning = true;
        }
      } else {
        this.currentTrackerTimeString = '00:00:00';
        this.titleService.setTitle('StundenStein');
        if (this.favIconRunning) {
          this.faviconService.activate('idle');
          this.favIconRunning = false;
        }
      }
    });
    this.currentTrackerTimeString = '00:00:00';
    this.titleService.setTitle('StundenStein');
    this.loadTimeTracker();
    this.automaticMode = true;
    // Block manual mode until implemented
    this.automaticLock = true;
    this.filteredIssues = this.issueCtrl.valueChanges.pipe(
      startWith(''),
      map(issue => (issue ? this._filterIssues(issue) : this.issues.slice()))
    );
    this.filteredProjects = this.projectCtrl.valueChanges.pipe(
      startWith(''),
      map(project =>
        project ? this._filterProjects(project) : this.projects.slice()
      )
    );
    this.filteredLogs = this.logCtrl.valueChanges.pipe(
      startWith(''),
      map(log => (log ? this._filterLogs(log) : this.logs.slice()))
    );
  }

  updateTracker(): void {
    if (isUndefined(this.timeTracker.id)) {
      return;
    }
    this.stoppingBlockedByLoading = true;
    let timeTracker: TimeTracker;
    timeTracker = {
      id: this.timeTracker.id,
      timeStarted: this.timeTracker.timeStarted,
      billable: this.timeTracker.billable,
      comment: this.timeTracker.comment,
      issue: this.timeTracker.issue,
      project: this.timeTracker.project
    };
    this.dataService.updateTimeTracker(timeTracker).subscribe(
      t => {
        if (!isNull(t) && !isUndefined(t)) {
          this.timeTracker = t;
          this.ensureSelectedIssueIsFromIssueList();
          this.ensureSelectedProjectIsFromProjectList();
          this.stoppingBlockedByLoading = false;
        } else {
          this.timeTracker = {
            billable: true,
            comment: '',
            issue: null,
            project: null
          };
          this.stoppingBlockedByLoading = false;
        }
        this.updateAutoCompletes();
      },
      error => {
        this.errorService.errorDialog('Couldn\'t update time tracker.');
        this.stoppingBlockedByLoading = false;
      }
    );
  }

  _getProjectColor(): string {
    if (!this.filteredObject) {
      return '#000';
    }
    if (
      isNull(this.timeTracker) ||
      isNull(this.timeTracker.project) ||
      isUndefined(this.timeTracker.project)
    ) {
      return '#000';
    }
    return this.timeTracker.project.color;
  }

  _displayIssue(issue: Issue): string {
    if (isNull(issue) || isUndefined(issue)) {
      return '';
    }
    return issue.tracker + ' #' + issue.id.toString() + ': ' + issue.subject;
  }

  _displayProject(project: Project): string {
    if (isNull(project) || isUndefined(project)) {
      return '';
    }
    return project.name;
  }

  _displayLog(log: string): string {
    if (isNull(log) || isUndefined(log)) {
      return '';
    }
    if (!log.includes('$$')) {
      return log;
    }
    return log.substring(log.indexOf('$$') + 2);
  }

  private _filterIssues(value): Issue[] {
    if (!this.isString(value)) {
      value = value.subject;
    }
    const filterValue: string = value
      .toLowerCase()
      .replace('#', '')
      .trim();

    return this.issues.filter(
      issue =>
        issue.subject.toLowerCase().includes(filterValue) ||
        issue.id.toString().includes(filterValue) ||
        issue.subject
          .toLowerCase()
          .includes(filterValue.substring(filterValue.lastIndexOf(': ') + 2))
    );
  }

  private isString(value): boolean {
    return Object.prototype.toString.call(value) === '[object String]';
  }

  private _filterProjects(value): Project[] {
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

    return this.projects.filter(project =>
      project.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterLogs(value): TimeLog[] {
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

  selectIssue(issue: Issue) {
    this.timeTracker.issue = issue;
    this.ensureSelectedIssueIsFromIssueList();
    if (
      !isUndefined(this.timeTracker.issue) &&
      !isNull(this.timeTracker.issue)
    ) {
      this.timeTracker.project = this.timeTracker.issue.project;
      this.ensureSelectedProjectIsFromProjectList();
      this.projectCtrl.setValue(this.timeTracker.project);
    }
    this.updateTracker();
  }

  selectLog(logData: string) {
    if (logData === null || logData.length < 1 || !logData.includes('$$')) {
      this.timeTracker.comment = '';
      return;
    }
    const logId = Number.parseInt(
      logData.substring(0, logData.indexOf('$$')),
      10
    );
    const log = this.logs.find(tlog => tlog.id === logId);
    this.timeTracker.comment = log.comment;
    if (isUndefined(log.project) || isNull(log.project)) {
      this.timeTracker.project = undefined;
      this.projectCtrl.setValue(undefined);
      this.timeTracker.issue = undefined;
      this.issueCtrl.setValue(undefined);
      return;
    }
    if (isUndefined(log.issue) || isNull(log.issue)) {
      this.selectProject(log.project);
      this.projectCtrl.setValue(this.timeTracker.project);
    } else {
      this.selectIssue(log.issue);
      this.issueCtrl.setValue(this.timeTracker.issue);
    }
  }

  ensureSelectedProjectIsFromProjectList() {
    if (!this.projects.includes(this.timeTracker.project)) {
      this.projects.forEach(project => {
        if (
          !isUndefined(this.timeTracker.project) &&
          project.id === this.timeTracker.project.id
        ) {
          this.timeTracker.project = project;
        }
      });
    }
  }

  ensureSelectedIssueIsFromIssueList() {
    if (!this.issues.includes(this.timeTracker.issue)) {
      this.issues.forEach(issue => {
        if (
          !isUndefined(this.timeTracker.issue) &&
          issue.id === this.timeTracker.issue.id
        ) {
          this.timeTracker.issue = issue;
        }
      });
    }
  }

  selectProject(project: Project) {
    this.timeTracker.project = project;
    this.ensureSelectedProjectIsFromProjectList();
    this.timeTracker.issue = undefined;
    this.issueCtrl.setValue(undefined);
    this.updateTracker();
  }

  setTimeString(duration: number): void {
    let sec: number = Math.floor(duration);
    let prefix = '';
    if (sec < 0) {
      sec = -sec;
      prefix = '- ';
      this.stoppingBlockedByNegativeTime = true;
    } else {
      this.stoppingBlockedByNegativeTime = false;
    }
    let min: number = Math.floor(sec / 60);
    const hrs: number = Math.floor(min / 60);
    sec = sec % 60;
    min = min % 60;
    let secStr: string = sec.toString();
    if (secStr.length < 2) {
      secStr = '0' + secStr;
    }
    let minStr: string = min.toString();
    if (minStr.length < 2) {
      minStr = '0' + minStr;
    }
    let hrsStr: string = hrs.toString();
    if (hrsStr.length < 2) {
      hrsStr = '0' + hrsStr;
    }
    this.currentTrackerTimeString =
      prefix + hrsStr + ':' + minStr + ':' + secStr;
    let shortForm: string;
    if (hrs === 0) {
      if (min === 0) {
        shortForm = sec.toString() + ' sec';
      } else {
        shortForm = min.toString() + ':' + secStr + ' min';
      }
    } else {
      shortForm = hrs.toString() + ':' + minStr + ':' + secStr + ' hrs';
    }
    shortForm = prefix + shortForm;
    let trackerInfo = '';
    if (
      this.timeTracker.comment !== '' &&
      !isUndefined(this.timeTracker.comment)
    ) {
      trackerInfo += '- ' + this.shorten(this.timeTracker.comment, 20) + ' ';
    }
    if (
      !(isUndefined(this.timeTracker.issue) || isNull(this.timeTracker.issue))
    ) {
      trackerInfo +=
        '- #' +
        this.timeTracker.issue.id +
        ': ' +
        this.shorten(this.timeTracker.issue.subject, 20) +
        ' ';
    }
    if (
      !(
        isUndefined(this.timeTracker.project) ||
        isNull(this.timeTracker.project)
      )
    ) {
      trackerInfo +=
        '- ' + this.shorten(this.timeTracker.project.name, 20) + ' ';
    }
    this.titleService.setTitle(
      shortForm + ' ' + trackerInfo + '• StundenStein'
    );
  }

  shorten(value: string, maxLength: number, abbr: string = '…'): string {
    if (isUndefined(value)) {
      return '';
    }
    if (value.length > maxLength) {
      value = value.substring(0, maxLength - abbr.length) + abbr;
    }
    return value;
  }

  private updateAutoCompletes(): void {
    this.issueCtrl.setValue(this.timeTracker.issue);
    this.projectCtrl.setValue(this.timeTracker.project);
  }

  loadTimeTracker() {
    const calls: Observable<any>[] = [
      this.dataService.getProjects(),
      this.dataService.getIssues()
    ];
    forkJoin(calls).subscribe(x => {
      this.dataService
        .getTimeTrackerByUserId(this.userService.getUser().id)
        .subscribe(t => {
          if (!isNull(t) && !isUndefined(t)) {
            this.timeTracker = t;
            this.ensureSelectedIssueIsFromIssueList();
            this.ensureSelectedProjectIsFromProjectList();
            this.stoppingBlockedByLoading = false;
          } else {
            this.timeTracker = {
              billable: true,
              comment: '',
              issue: null,
              project: null
            };
            this.stoppingBlockedByLoading = false;
          }
          this.updateAutoCompletes();
          this.stoppingBlockedByLoading = false;
        });
    });
  }

  startTimeTracker(): void {
    this.startingBlockedByLoading = true;
    this.dataService
      .startTimeTracker(this.timeTracker)
      .subscribe(timeTracker => {
        this.timeTracker = timeTracker;
        this.ensureSelectedIssueIsFromIssueList();
        this.ensureSelectedProjectIsFromProjectList();
        this.startingBlockedByLoading = false;
      });
  }

  stopTimeTracker(): void {
    this.stoppingBlockedByLoading = true;
    let timeTracker: TimeTracker;
    timeTracker = {
      id: this.timeTracker.id,
      timeStarted: this.timeTracker.timeStarted,
      billable: this.timeTracker.billable,
      comment: this.timeTracker.comment,
      issue: this.timeTracker.issue,
      project: this.timeTracker.project
    };
    this.dataService.stopTimeTracker(timeTracker).subscribe(
      data => {
        if (data === undefined || data === null) {
          this.errorService.errorDialog('Couldn\'t stop time tracker');
          this.stoppingBlockedByLoading = false;
        } else {
          this.reloadTriggerSerivce.triggerTimeLogAdded(data);
          this.loadTimeTracker();
        }
      },
      error => {
        this.errorService.errorDialog('Couldn\'t stop time tracker');
        this.stoppingBlockedByLoading = true;
      }
    );
  }
}
