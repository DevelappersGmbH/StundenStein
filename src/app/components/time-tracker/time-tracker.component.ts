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
import { forkJoin, interval, Observable, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { isNull, isUndefined } from 'util';
import { Issue } from 'src/app/model/issue.interface';
import { map, startWith } from 'rxjs/operators';
import { Project } from 'src/app/model/project.interface';
import { ReloadTriggerService } from 'src/app/services/reload-trigger.service';
import { TimeLog } from 'src/app/model/time-log.interface';
import { TimeTracker } from 'src/app/model/time-tracker.interface';
import { Title } from '@angular/platform-browser';
import { Time } from '@angular/common';
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
  startTimeModification = false;
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
  startTimeCtrl = new FormControl();
  filteredIssues: Observable<Issue[]>;
  filteredProjects: Observable<Project[]>;
  filteredLogs: Observable<TimeLog[]>;
  filteredObject = false;
  stoppingBlockedByNegativeTime = true;
  componentBlockedByInitialTrackerLoad = true;
  startingBlockedByLoading = false;
  stoppingBlockedByLoading = false;
  loggingBlockedByLoading = false;
  newTrackerStartTime: Time;
  newTrackerStart: Date;
  newTrackerTimeString: string;
  newTrackerPreview: Subscription;
  manualStartDate: Date;
  manualStopDate: Date;
  manualStartTime: Time;
  manualStartTimeIllegal = true;
  manualStopTime: Time;
  manualStopTimeIllegal = true;
  timer: Subscription;
  trackerReloading: Subscription;
  lastTrackerUpdate: Date = this.now();

  favIconRunning = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (typeof changes['timeLogs'] !== 'undefined') {
      const change = changes['timeLogs'];
      this.logs = [];
      const logComp: String[] = [];
      change.currentValue.slice(0, 100).forEach(log => {
        const logCompString: String = this.makeLogComparisonString(log);
        if (
          !isUndefined(log.comment) &&
          !isNull(log.comment) &&
          log.comment.length > 0 &&
          !logComp.includes(logCompString)
        ) {
          this.logs.unshift(log);
          logComp.unshift(logCompString);
        }
      });
    }
  }

  /**
   * Returns a String containing all important data of given TimeLog for comment-issue-project comparison
   * @param log TimeLog to create comparison string from
   */
  makeLogComparisonString(log: TimeLog): String {
    let issueComp: String = '';
    if (log.issue !== null && log.issue !== undefined) { issueComp = log.issue.id.toString(); }
    let projectComp: String = '';
    if (log.project !== null && log.project !== undefined) { projectComp = log.project.id.toString(); }
    return log.comment + '|' + issueComp + '|' + projectComp;
  }


  ngOnInit() {
    this.issueCtrl.disable();
    this.logCtrl.disable();
    this.projectCtrl.disable();
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
    this.trackerReloading = interval(10000).subscribe( val => {
      this.loadTimeTrackerChanges();
    });
    this.timer = interval(1000).subscribe(val => {
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
    this.trackerService.logoutEvent.subscribe(logout => {
      this.timer.unsubscribe();
      this.trackerReloading.unsubscribe();
      this.titleService.setTitle('StundenStein');
      this.faviconService.activate('idle');
    });
    this.currentTrackerTimeString = '00:00:00';
    this.titleService.setTitle('StundenStein');
    this.loadTimeTracker();
    this.automaticMode = true;
    this.manualStartDate = this.now();
    this.manualStopDate = this.now();

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

  /**
   * Disable start time modification
   */
  disableStartTimeModification(): void {
    if (this.newTrackerPreview !== null && this.newTrackerPreview !== undefined) { this.newTrackerPreview.unsubscribe(); }
    this.startTimeModification = false;
  }

  /**
   * Enable start time modification if allowed
   */
  enableStartTimeModification(): void {
    if (this.timeTracker !== null && this.timeTracker !== undefined) {
      if (this.timeTracker.id !== null && this.timeTracker.id !== undefined) {
        if (!this.stoppingBlockedByLoading && !this.stoppingBlockedByNegativeTime) {
          this.newTrackerStart = this.timeTracker.timeStarted;
          this.startTimeCtrl.setValue(this.timeTracker.timeStarted.toLocaleTimeString());
          this.newTrackerPreview = interval(1000).subscribe(timePassed => {
            if (this.timeTracker === null ||
              this.timeTracker === undefined ||
              this.timeTracker.id === null ||
              this.timeTracker.id === undefined ||
              this.stoppingBlockedByLoading ||
              this.stoppingBlockedByNegativeTime) {
                this.disableStartTimeModification();
              }
            const duration = ((new Date().valueOf() - new Date(this.newTrackerStart).valueOf()) / 1000);
            let sec: number = Math.floor(duration);
            let prefix = '';
            this.stoppingBlockedByNegativeTime = (sec <= 3);
            if (sec < 0) {
              sec = -sec;
              prefix = '- ';
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
            this.newTrackerTimeString =
              prefix + hrsStr + ':' + minStr + ':' + secStr;
          });
          this.startTimeModification = true;
        }
      }
    }
  }

  /**
   * Modifies selected tracker start time if allowed
   */
  modifyTrackerStart(): void {
    this.updateNewTrackerTimeString();
    this.timeTracker.timeStarted = this.newTrackerStart;
    this.updateTracker();
    this.disableStartTimeModification();
  }

  updateNewTrackerTimeString(): void {
    this.newTrackerStartTime = this.stringToTime(this.startTimeCtrl.value);
    this.newTrackerStart = new Date(this.timeTracker.timeStarted.valueOf());
    this.newTrackerStart.setHours(this.newTrackerStartTime.hours);
    this.newTrackerStart.setMinutes(this.newTrackerStartTime.minutes);
  }

  /**
   * Validates start and end time selected in manual mode
   */
  validateStartStop(): boolean {
    this.manualStartTimeIllegal = false;
    this.manualStopTimeIllegal = false;
    if (isUndefined(this.manualStartTime)) {
      this.manualStartTimeIllegal = true;
    }
    if (isUndefined(this.manualStopTime)) {
      this.manualStopTimeIllegal = true;
    }
    if (!isUndefined(this.manualStartTime) && !isUndefined(this.manualStopTime) &&
    this.sameday(this.manualStartDate, this.manualStopDate)) {
      if (this.isLater(this.manualStartTime, this.manualStopTime)) {
        // FAIL: stop before start
        this.manualStopTimeIllegal = true;
      }
      if ( JSON.stringify(this.manualStartTime) === JSON.stringify(this.manualStopTime)) {
        // FAIL: stop and start equal
        this.manualStopTimeIllegal = true;
      }
    }
    if (!isUndefined(this.manualStartTime) &&
    this.sameday(this.manualStartDate, this.now())) {
      if (this.isLater(this.manualStartTime, this.currentTime())) {
        // FAIL: starts before now
        this.manualStartTimeIllegal = true;
      }
    }
    if (!isUndefined(this.manualStopTime) &&
    this.sameday(this.manualStopDate, this.now())) {
      if (this.isLater(this.manualStopTime, this.currentTime())) {
        // FAIL: ends before now
        this.manualStopTimeIllegal = true;
      }
    }
    if (this.manualStartTimeIllegal || this.manualStopTimeIllegal) { return false; }
    return true;
  }

  /**
   * Compares if two Date objects represent the same day
   * @param date1 first date
   * @param date2 second date
   */
  sameday(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
  }

  /**
   * Tells if a time is later than another one
   * @param reference time to check
   * @param compareTo time to compare against
   */
  isLater(reference: Time, compareTo: Time): boolean {
    if (reference.hours > compareTo.hours) { return true; }
    if (reference.hours === compareTo.hours && reference.minutes > compareTo.minutes) { return true; }
    return false;
  }

  /**
   * Converts a 24hr time string to Time Object
   * @param value time string (24hr format)
   */
  stringToTime(value: string): Time {
    return {
      hours: parseInt(value.substring(0, 2), 10) ,
      minutes: parseInt(value.substring(3, 5), 10)
    };
  }

  /**
   * Converts a Time Object to 24hr time string
   * @param value time object
   */
  timeToString(value: Time): string {
    if (isUndefined(value) || isUndefined(value.hours)) {
      return '';
    }
    let hrs = value.hours.toString();
    if (hrs.length < 2) { hrs = '0' + hrs; }
    let min = value.minutes.toString();
    if (min.length < 2) { min = '0' + min; }
    return hrs + ':' + min;
  }

  /**
   * Returns a new Date object which is the current date
   */
  now(): Date {
    return new Date();
  }

  /**
   * Returns the current time
   */
  currentTime(): Time {
    const dateObj = this.now();
    return {
      hours: dateObj.getHours(),
      minutes: dateObj.getMinutes()
    };
  }

  updateTracker(stopTrackerAfterwards = false, startNewTrackerAfterStoppingIt = false): void {
    this.lastTrackerUpdate = this.now();
    this.timeTracker.comment = this.logCtrl.value;
    if (this.timeTracker.comment !== null && this.timeTracker.comment !== undefined && this.timeTracker.comment.includes('$$')) {
      this.timeTracker.comment = this.timeTracker.comment.substring(this.timeTracker.comment.indexOf('$$') + 2);
    }
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
        this.lastTrackerUpdate = this.now();
        if (!isNull(t) && !isUndefined(t)) {
          this.timeTracker = t;
          this.ensureSelectedIssueIsFromIssueList();
          this.ensureSelectedProjectIsFromProjectList();
        } else {
          this.timeTracker = {
            billable: true,
            comment: '',
            issue: null,
            project: null
          };
        }
        if (stopTrackerAfterwards) {
          this.stopTimeTracker(startNewTrackerAfterStoppingIt, false);
        } else {
          this.stoppingBlockedByLoading = false;
          this.updateAutoCompletes();
        }
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
    this.stoppingBlockedByNegativeTime = (sec <= 3);
    if (sec < 0) {
      sec = -sec;
      prefix = '- ';
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
    this.logCtrl.setValue(this.timeTracker.comment);
  }

  loadTimeTracker(startNewIfNone = false) {
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
          } else {
            this.timeTracker = {
              billable: true,
              comment: '',
              issue: null,
              project: null
            };
            if (startNewIfNone) {
              this.startTimeTracker();
            }
          }
          this.updateAutoCompletes();
          this.stoppingBlockedByLoading = false;
          this.initialTrackerLoadFinished();
        });
    });
  }

  /**
   * Gets the current TimeTracker from the API and makes local changes if necessary
   * @return Changes have been applied
   */
  loadTimeTrackerChanges(): boolean {
    // Check if there is a reload happening or has been recently (last 5sec)
    if (this.stoppingBlockedByLoading || this.startingBlockedByLoading ||
      Math.abs((this.lastTrackerUpdate.getTime() - this.now().getTime()) / 1000) < 5 ) {
      return false;
    }
    // Prepare TimeTracker query
    const calls: Observable<any>[] = [
      this.dataService.getProjects(),
      this.dataService.getIssues()
    ];
    forkJoin(calls).subscribe(x => {
      this.dataService
        .getTimeTrackerByUserId(this.userService.getUser().id)
        .subscribe(t => {
          // Put current remote tracker data to trackerUpdate variable
          let trackerUpdate: Partial<TimeTracker>;
          if (!isNull(t) && !isUndefined(t)) {
            trackerUpdate = t;
          } else {
            trackerUpdate = {
              billable: true,
              comment: '',
              issue: null,
              project: null
            };
          }
          // Check again if there is a reload happening or has been recently (last 5sec)
          if (this.stoppingBlockedByLoading || this.startingBlockedByLoading ||
            Math.abs((this.lastTrackerUpdate.getTime() - this.now().getTime()) / 1000) < 5) {
            return false;
          }
          // Set tracker update to now
          this.lastTrackerUpdate = this.now();
          // Create flag to indicate if anything has changed
          let dataChanged = false;
          // Check if local tracker is unset (undefined or null), or if IDs don't match
          if (isNull(this.timeTracker) || isUndefined(this.timeTracker)
            || (isUndefined(this.timeTracker.id) && !isUndefined(trackerUpdate.id))) {
              this.timeTracker = trackerUpdate;
              this.updateAutoCompletes();
              dataChanged = true;
            }
          // Check if both local and remote IDs are unset
          if ((isUndefined(this.timeTracker.id) || isNull(this.timeTracker.id) )
            && (isUndefined(trackerUpdate.id) || isNull(trackerUpdate.id))) {
            return false;
          }
          // Check again if IDs don't match
          if (this.timeTracker.id !== trackerUpdate.id) {
            this.timeTracker = trackerUpdate;
            this.updateAutoCompletes();
            dataChanged = true;
          }
          // Check for inequality of issue
          if (
            (
              !(isUndefined(this.timeTracker.issue) || isNull(this.timeTracker.issue)) &&
              (isUndefined(trackerUpdate.issue) || isNull(trackerUpdate.issue))
            )
            ||
            (
              (isUndefined(this.timeTracker.issue) || isNull(this.timeTracker.issue)) &&
              !(isUndefined(trackerUpdate.issue) || isNull(trackerUpdate.issue))
            )
            ||
            (
              !(isUndefined(this.timeTracker.issue) || isNull(this.timeTracker.issue)) &&
              this.timeTracker.issue.id !== trackerUpdate.issue.id
            )) {
              this.timeTracker.issue = trackerUpdate.issue;
              this.issueCtrl.setValue(this.timeTracker.issue);
              dataChanged = true;
          }
          // Check for inequality of project
          if (
            (
              !(isUndefined(this.timeTracker.project) || isNull(this.timeTracker.project)) &&
              (isUndefined(trackerUpdate.project) || isNull(trackerUpdate.project))
            )
            ||
            (
              (isUndefined(this.timeTracker.project) || isNull(this.timeTracker.project)) &&
              !(isUndefined(trackerUpdate.project) || isNull(trackerUpdate.project))
            )
            ||
            (
              !(isUndefined(this.timeTracker.project) || isNull(this.timeTracker.project)) &&
              this.timeTracker.project.id !== trackerUpdate.project.id
            )) {
              this.timeTracker.project = trackerUpdate.project;
              this.projectCtrl.setValue(this.timeTracker.project);
              dataChanged = true;
          }
          // Check for inequality of timeStarted
          if (this.timeTracker.timeStarted !== trackerUpdate.timeStarted) {
            this.timeTracker.timeStarted = trackerUpdate.timeStarted;
            dataChanged = true;
          }
          // Check for inequality of billable
          if (this.timeTracker.billable !== trackerUpdate.billable) {
            this.timeTracker.billable = trackerUpdate.billable;
            dataChanged = true;
          }
          // Check for inequality of comment
          if (this.timeTracker.comment !== trackerUpdate.comment) {
            this.timeTracker.comment = trackerUpdate.comment;
            this.logCtrl.setValue(this.timeTracker.comment);
            dataChanged = true;
          }
          // Return flag that indicates if changes have been applied
          return dataChanged;
        });
    });
  }

  /**
   * Enables GUI interaction after tracker has been loaded initially
   */
  private initialTrackerLoadFinished(): void {
    this.componentBlockedByInitialTrackerLoad = false;
    this.issueCtrl.enable();
    this.logCtrl.enable();
    this.projectCtrl.enable();
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

  /**
   * Stops the running tracker and starts a new one with empty data
   */
  stopAndNew(): void {
    this.stopTimeTracker(true);
  }

  doUpdateIfNecessaryAndStop(startNewAfterwards = false): void {
    let comment: String = this.logCtrl.value;
    if (comment !== null && comment !== undefined && comment.includes('$$')) {
      comment = comment.substring(comment.indexOf('$$') + 2);
    }
    const issue: Issue = this.issueCtrl.value;
    const project: Project = this.projectCtrl.value;
    if (
      this.timeTracker.comment === comment &&
      this.timeTracker.issue === issue &&
      this.timeTracker.project === project
      ) {
        this.stopTimeTracker(startNewAfterwards, false);
    } else {
      this.updateTracker(true, startNewAfterwards);
    }
  }

  stopTimeTracker(startNewAfterwards = false, updateBeforeExecution = true): void {
    // Check if update has to be performed first
    if (updateBeforeExecution) {
      this.doUpdateIfNecessaryAndStop(startNewAfterwards);
      return;
    }
    this.lastTrackerUpdate = this.now();
    this.stoppingBlockedByLoading = true;
    this.timeTracker.comment = this.logCtrl.value;
    if (this.timeTracker.comment !== undefined && this.timeTracker.comment.includes('$$')) {
      this.timeTracker.comment = this.timeTracker.comment.substring(this.timeTracker.comment.indexOf('$$') + 2);
    }
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
        this.lastTrackerUpdate = this.now();
        if (data === undefined || data === null) {
          this.errorService.errorDialog('Couldn\'t stop time tracker');
          this.stoppingBlockedByLoading = false;
        } else {
          this.reloadTriggerSerivce.triggerTimeLogAdded(data);
          this.loadTimeTracker(startNewAfterwards);
        }
      },
      error => {
        let errorMessage: string = 'Couldn\'t stop time tracker.';
        if (error !== undefined && error.error !== undefined && error.error.message !== undefined) {
          errorMessage += '\n' + error.error.message;
        }
        this.errorService.errorDialog(errorMessage);
        this.stoppingBlockedByLoading = false;
      }
    );
  }

  createLog(): void {
    this.loggingBlockedByLoading = true;
    this.automaticLock = true;
    if (this.validateStartStop()) {
      this.manualStartDate.setHours(this.manualStartTime.hours);
      this.manualStartDate.setMinutes(this.manualStartTime.minutes);
      this.manualStopDate.setHours(this.manualStopTime.hours);
      this.manualStopDate.setMinutes(this.manualStopTime.minutes);
      this.dataService.createTimeLog({
        id: undefined,
        timeStarted: this.manualStartDate,
        timeStopped: this.manualStopDate,
        comment: this.timeTracker.comment,
        timeInHours: 0,
        booked: !isNull(this.timeTracker.project) && !isUndefined(this.timeTracker.project),
        hourGlassTimeBookingId: undefined,
        redmineTimeEntryId: undefined,
        billable: this.timeTracker.billable,
        issue: this.timeTracker.issue,
        project: this.timeTracker.project,
        user: this.userService.getUser()
      }).subscribe(result => {
        this.reloadTriggerSerivce.triggerTimeLogAdded(result);
        this.loggingBlockedByLoading = false;
        this.automaticLock = false;
      }, error => {
        this.errorService.errorDialog(error.error.message[0].replace(/\[.*\]/, ''));
        this.loggingBlockedByLoading = false;
        this.automaticLock = false;
      });
    } else {
      this.loggingBlockedByLoading = false;
      this.automaticLock = false;
    }
  }

}
