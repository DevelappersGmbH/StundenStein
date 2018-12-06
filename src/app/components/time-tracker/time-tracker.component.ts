import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/model/project.interface';
import { Issue } from 'src/app/model/issue.interface';
import { isUndefined, isNull } from 'util';
import { FormControl } from '@angular/forms';
import { Observable, forkJoin, interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DataService } from 'src/app/services/data/data.service';
import { TimeTracker } from 'src/app/model/time-tracker.interface';
import { UserService } from 'src/app/services/user/user.service';
import { Title } from '@angular/platform-browser';
import { Time } from '@angular/common';

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss']
})
export class TimeTrackerComponent implements OnInit {

  constructor(
    private dataService: DataService ,
    private userService: UserService ,
    private titleService: Title
    ) { }

  projects: Project[] = [];
  issues: Issue[] = [];
  issueStrings: string[] = [];
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
  filteredIssues: Observable<Issue[]>;
  filteredProjects: Observable<Project[]>;
  filteredObject = false;
  stoppingBlockedByNegativeTime = true;
  startingBlockedByLoading = false;
  stoppingBlockedByLoading = false;
  manualStartDate: Date;
  manualStopDate: Date;
  manualStartTime: Time;
  manualStopTime: Time;

  ngOnInit() {
    interval(1000).subscribe( val => {
      if (!isUndefined(this.timeTracker.timeStarted)) {
        this.setTimeString(((new Date()).valueOf() - (new Date(this.timeTracker.timeStarted)).valueOf()) / 1000);
      } else {
        this.currentTrackerTimeString  = '00:00:00';
        this.titleService.setTitle('StundenStein');
      }
    });
    this.loadProjects();
    this.loadIssues();
    this.currentTrackerTimeString  = '00:00:00';
    this.titleService.setTitle('StundenStein');
    this.loadTimeTracker();
    this.automaticMode = false;
    // Block manual mode until implemented
    // this.automaticLock = true;
    this.manualStartDate = this.today();
    this.manualStopDate = this.today();
    this.filteredIssues = this.issueCtrl.valueChanges
      .pipe(
        startWith(''),
        map(issue => issue ? this._filterIssues(issue) : this.issues.slice())
      );
    this.filteredProjects = this.projectCtrl.valueChanges
      .pipe(
        startWith(''),
        map(project => project ? this._filterProjects(project) : this.projects.slice())
      );
  }

  /**
   * Validates start and end time selected in manual mode
   */
  validateStartStop(): void {
    console.log('validate');
    console.log(this.manualStartTime);
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
   * Returns a new Date object which is todays date
   */
  today(): Date {
    return new Date();
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
    this.dataService.updateTimeTracker(timeTracker).subscribe( t => {
      if (!isNull(t) && !(isUndefined(t))) {
        this.timeTracker = t;
        this.extractFromTimeTracker();
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
    }, error => {
      console.error('Couldn\'t update time tracker.');
      this.stoppingBlockedByLoading = false;
    });
  }

  _getProjectColor(): string {
    if (!this.filteredObject) { return '#000'; }
    if (isNull(this.timeTracker) || isNull(this.timeTracker.project) || isUndefined(this.timeTracker.project)) { return '#000'; }
    return this.timeTracker.project.color;
  }

  _displayIssue(issue: Issue): string {
    if (isNull(issue) || isUndefined(issue)) { return ''; }
    return issue.tracker + ' #' + issue.id.toString() + ': ' + issue.subject;
  }

  _displayProject(project: Project): string {
    if (isNull(project) || isUndefined(project)) { return ''; }
    return project.name;
  }

  private _filterIssues(value): Issue[] {
    if (!this.isString(value)) { value = value.subject; }
    const filterValue: string = value.toLowerCase().replace('#', '').trim();

    return this.issues.filter(issue =>
      issue.subject.toLowerCase().includes(filterValue) ||
      issue.id.toString().includes(filterValue) ||
      issue.subject.toLowerCase().includes(filterValue.substring(filterValue.lastIndexOf(': ') + 2))
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
    const filterValue = value.toLowerCase().replace('#', '').trim();

    return this.projects.filter(project => project.name.toLowerCase().includes(filterValue));
  }

  selectIssue(issue: Issue) {
    this.timeTracker.issue = issue;
    this.ensureSelectedIssueIsFromIssueList();
    if (!isUndefined(this.timeTracker.issue)) {
      this.timeTracker.project = this.timeTracker.issue.project;
      this.ensureSelectedProjectIsFromProjectList();
      this.projectCtrl.setValue(this.timeTracker.project);
    }
    this.updateTracker();
  }

  ensureSelectedProjectIsFromProjectList() {
    if (!this.projects.includes(this.timeTracker.project)) {
      this.projects.forEach( project => {
        if (JSON.stringify(project) === JSON.stringify(this.timeTracker.project)) {
          this.timeTracker.project = project;
        }
      });
    }
  }

  ensureSelectedIssueIsFromIssueList() {
    if (!this.issues.includes(this.timeTracker.issue)) {
      this.issues.forEach( issue => {
        if (JSON.stringify(issue) === JSON.stringify(this.timeTracker.issue)) {
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

  loadProjects() {
    this.dataService.getProjects().subscribe( data => {
      this.projects = data;
    }, error => {
      console.error('Couldn\'t get projects from data service.');
    });
  }

  loadIssues() {
    this.dataService.getIssues().subscribe( data => {
      this.issues = data;
    }, error => {
      console.error('Couldn\'t get issues from data service.');
    });
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
    let secStr: string = sec.toString(); if (secStr.length < 2) { secStr = '0' + secStr; }
    let minStr: string = min.toString(); if (minStr.length < 2) { minStr = '0' + minStr; }
    let hrsStr: string = hrs.toString(); if (hrsStr.length < 2) { hrsStr = '0' + hrsStr; }
    this.currentTrackerTimeString = prefix + hrsStr + ':' + minStr + ':' + secStr;
    let shortForm: string;
    if (hrs === 0) {
      if (min === 0) {
        shortForm = sec.toString() + ' sec';
      } else {
        shortForm =  min.toString() + ':' + secStr + ' min';
      }
    } else {
      shortForm = hrs.toString() + ':' + minStr + ':' + secStr + ' hrs';
    }
    shortForm = prefix + shortForm;
    let trackerInfo = '';
    if (this.timeTracker.comment !== '' && !isUndefined(this.timeTracker.comment)) {
      trackerInfo += '- ' + this.shorten(this.timeTracker.comment, 20) + ' ';
    }
    if (!(isUndefined(this.timeTracker.issue) || isNull(this.timeTracker.issue))) {
      trackerInfo += '- #' + this.timeTracker.issue.id + ': ' +  this.shorten(this.timeTracker.issue.subject, 20) + ' ';
    }
    if (!(isUndefined(this.timeTracker.project) || isNull(this.timeTracker.project))) {
      trackerInfo += '- ' + this.shorten(this.timeTracker.project.name, 20) + ' ';
    }
    this.titleService.setTitle(shortForm + ' ' + trackerInfo +   '• StundenStein');
  }

  private shorten(value: string, maxLength: number, abbr: string = '…'): string {
    if (isUndefined(value)) { return ''; }
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
      this.dataService.getTimeTrackerByUserId(this.userService.getUser().id).subscribe(t => {
        if (!isNull(t) && !(isUndefined(t))) {
          this.timeTracker = t;
          this.extractFromTimeTracker();
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

  extractFromTimeTracker(): void {
    this.ensureSelectedIssueIsFromIssueList();
    this.ensureSelectedProjectIsFromProjectList();
  }

  startTimeTracker(): void {
    this.startingBlockedByLoading = true;
    this.dataService.startTimeTracker(this.timeTracker).subscribe(
      timeTracker => {
        this.timeTracker = timeTracker;
        this.extractFromTimeTracker();
        this.startingBlockedByLoading = false;
      }
     );
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
    this.dataService.stopTimeTracker(timeTracker).subscribe( data => {
      if (data === false) {
        console.error('Couldn\'t stop time tracker');
        this.stoppingBlockedByLoading = false;
      } else {
        this.loadTimeTracker();
      }
    }, error => {
      console.error(error);
      this.stoppingBlockedByLoading = true;
    }
    );
  }

  createLog(): void {

  }

}
