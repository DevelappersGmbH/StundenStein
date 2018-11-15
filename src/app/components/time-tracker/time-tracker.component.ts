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

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss']
})
export class TimeTrackerComponent implements OnInit {

  constructor(
    private dataService: DataService ,
    private userService: UserService
    ) { }

  projects: Project[];
  issues: Issue[];
  // issueStrings: string[] = [];
  currentTrackerTimeString: string;
  automaticMode: boolean;
  automaticLock: boolean;
  timeTracker: Partial<TimeTracker> = {
    billable: false,
    comment: '',
    issue: null,
    project: null
  };
  /*
  issueCtrl = new FormControl();
  projectCtrl = new FormControl();
  filteredIssues: Observable<Issue[]>;
  filteredProjects: Observable<Project[]>;
  */

  ngOnInit() {
    this.loadProjects();
    this.loadIssues();
    this.loadTimeTracker();
    this.currentTrackerTimeString  = '00:00:00';
    this.automaticMode = true;
    // Block manual mode until implemented
    this.automaticLock = true;
    /*this.filteredIssues = this.issueCtrl.valueChanges
      .pipe(
        startWith(''),
        map(issue => issue ? this._filterIssues(issue) : this.issues.slice())
      );
    this.filteredProjects = this.projectCtrl.valueChanges
      .pipe(
        startWith(''),
        map(project => project ? this._filterProjects(project) : this.projects.slice())
      );*/
  }

  /*

  private _filterIssues(value: string): Issue[] {
    const filterValue = value.toLowerCase().replace('#', '').trim();

    return this.issues.filter(issue => issue.subject.toLowerCase().includes(filterValue) || issue.id.toString().includes(filterValue) );
  }

  private _filterProjects(value: string): Project[] {
    const filterValue = value.toLowerCase().replace('#', '').trim();

    return this.projects.filter(project => project.name.toLowerCase().includes(filterValue));
  }

  getIssueFromAutoSelectString(selector: string): Issue {
    if (this.issueStrings.length !== this.issues.length) {
      this.issues.forEach( issue => {
        this.issueStrings.push(
          issue.tracker + ' #' + issue.id + ': ' + issue.subject
        );
      });
    }
    for (let i = 0; i < this.issues.length; i++) {
      if (this.issueStrings[i] === selector) {
        return this.issues[i];
      }
    }
    return undefined;
  }

  */

  selectIssue() {
    // console.log('issue string selected: ' + data);
    // this.selectedIssue = this.getIssueFromAutoSelectString(data);
    if (isUndefined(this.timeTracker.issue)) {
      this.timeTracker.issue = undefined;
    } else {
      this.timeTracker.project = this.timeTracker.issue.project;
      this.ensureSelectedProjectIsFromProjectList();
    }
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

  selectProject() {
    this.timeTracker.issue = undefined;
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
    let min: number = Math.floor(sec / 60);
    const hrs: number = Math.floor(min / 60);
    sec = sec % 60;
    min = min % 60;
    let secStr: string = sec.toString(); if (secStr.length < 2) { secStr = '0' + secStr; }
    let minStr: string = min.toString(); if (minStr.length < 2) { minStr = '0' + minStr; }
    let hrsStr: string = hrs.toString(); if (hrsStr.length < 2) { hrsStr = '0' + hrsStr; }
    this.currentTrackerTimeString = hrsStr + ':' + minStr + ':' + secStr;
  }

  loadTimeTracker() {
    const calls: Observable<any>[] = [
      this.dataService.getProjects(),
      this.dataService.getIssues()
    ];
    forkJoin(calls).subscribe(x => {
      this.dataService.getTimeTrackerByUserId(this.userService.getUser().id).subscribe(t => {
        if (!isNull(t)) {
          this.timeTracker = t;
          this.extractFromTimeTracker();
        }
      });
    });
  }

  extractFromTimeTracker(): void {
    this.ensureSelectedIssueIsFromIssueList();
    this.ensureSelectedProjectIsFromProjectList();
    interval(1000).subscribe( val => {
      this.setTimeString(((new Date()).valueOf() - (new Date(this.timeTracker.timeStarted)).valueOf()) / 1000);
    });
  }

  startTimeTracker(): void {
    this.dataService.startTimeTracker(this.timeTracker.issue.id, this.timeTracker.comment).subscribe(
      timeTracker => {
        this.timeTracker = timeTracker;
        this.extractFromTimeTracker();
      }
     );
  }

  stopTimeTracker(): void {
    console.error('Not implemented yet.');
  }

}
