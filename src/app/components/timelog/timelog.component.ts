import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { DeleteWarningComponent } from '../delete-warning/delete-warning.component';
import { FormControl } from '@angular/forms';
import { Issue } from '../../model/issue.interface';
import { map, startWith } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Observable } from 'rxjs';
import { Project } from '../../model/project.interface';
import { TimeLog } from '../../model/time-log.interface';
import { User } from '../../model/user.interface';

@Component({
  selector: 'app-timelog',
  templateUrl: './timelog.component.html',
  styleUrls: ['./timelog.component.scss']
})
export class TimeLogComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private deleteDialog: MatDialog
  ) {}

  @Input() timeLog: TimeLog;

  trackedTime: Date;
  active = false;
  editMode = false;
  editButton = 'edit';

  projects: Project[] = [];
  issues: Issue[] = [];

  issueControl = new FormControl();
  projectControl = new FormControl();
  issueOptions: Issue[] = [];
  projectOptions: Project[] = [];
  filteredIssues: Observable<Issue[]>;
  filteredProjects: Observable<Project[]>;

  filteredObject = false;

  ngOnInit() {
    this.trackedTime = new Date(
      this.timeLog.timeStarted.getFullYear(),
      this.timeLog.timeStarted.getMonth(),
      this.timeLog.timeStarted.getDay(),
      Math.floor(this.timeLog.timeInHours),
      (this.timeLog.timeInHours * 60) % 60,
      0,
      0
    );

    this.issueControl.setValue(
      this.timeLog.issue ? this.timeLog.issue.subject : ''
    );
    this.projectControl.setValue(
      this.timeLog.project ? this.timeLog.project.name : ''
    );

    this.loadIssues();
    this.loadProjects();

    this.issueControl.valueChanges.subscribe(value => {
      if (value === '') {
        if (this.timeLog.project && this.timeLog.issue) {
          this.updateIssueOptions(this.timeLog.project);
        } else if (this.timeLog.issue) {
          this.projectControl.setValue('');
        }
        this.projectOptions = this.projects;
        this.timeLog.issue = null;
      }
    });

    this.projectControl.valueChanges.subscribe(value => {
      if (value === '') {
        console.log('Here');
        this.issueOptions = this.issues;
        console.log('Length options: ', this.issueOptions.length);
        this.projectOptions = this.projects;
        this.issueControl.setValue('Dummy value');
        this.issueControl.setValue('');
        this.timeLog.issue = null;
        this.timeLog.project = null;
      }
    });

    this.filteredIssues = this.issueControl.valueChanges.pipe(
      startWith(''),
      map(issue =>
        issue ? this.filterIssues(issue) : this.issueOptions.slice()
      )
    );

    this.filteredProjects = this.projectControl.valueChanges.pipe(
      startWith(''),
      map(project => this.filterProjects(project))
    );

    if (
      !this.timeLog.issue ||
      !this.timeLog.project ||
      this.timeLog.project.name === '' ||
      this.timeLog.issue.subject === ''
    ) {
      this.editButton = 'playlist_add';
    }
  }

  loadProjects() {
    this.dataService.getProjects().subscribe(
      data => {
        this.projects = data;
        this.projectOptions = this.projects;
      },
      error => {
        console.error('Couldn\'t get projects from data service.');
      }
    );
  }

  loadIssues() {
    this.dataService.getIssues().subscribe(
      data => {
        this.issues = data;
        this.issueOptions = this.issues;
      },
      error => {
        console.error('Couldn\'t get issues from data service.');
      }
    );
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
    console.log('Issue: ', issue);

    if (this.findIssue(issue)) {
      console.log('Existing issue detected');
      this.timeLog.issue = issue;
      this.timeLog.project = issue.project;
      this.issueControl.setValue(
        this.timeLog.issue ? this.timeLog.issue.subject : ''
      );

      this.updateIssueOptions(this.timeLog.project);

      this.projectControl.setValue(
        this.timeLog.project ? this.timeLog.project.name : ''
      );
    } else {
      console.log('No such issue!');
    }
    console.log(this.projectOptions);
    // TODO: update timelog
    this.updateTimeLog();
  }

  selectProject(project) {
    if (this.findProject(project)) {
      console.log('New project detected', project);
      this.timeLog.project = project;
      this.projectControl.setValue(project ? project.name : '');
      this.updateIssueOptions(project);
      this.issueControl.setValue('Dummy value');
      this.issueControl.setValue(
        this.timeLog.issue ? this.timeLog.issue.subject : ''
      );
      console.log(this.issueOptions);
    } else {
      console.log('Something went wrong');
    }
    // TODO: update timelog
  }

  updateComment(comment) {
    this.timeLog.comment = comment;
    // TODO: update timelog
    this.updateTimeLog();
  }

  private searchIssueById(id): Issue {
    this.issues.forEach(issue => {
      if (issue.id === id) {
        return issue;
      }
    });
    console.log('No matching issue found');
    return undefined;
  }

  private searchProjectById(id): Project {
    this.projects.forEach(project => {
      if (project.id === id) {
        return project;
      }
    });
    console.log('No matching project found');
    return undefined;
  }

  startTracker() {
    /*
    startTracker from timetracker component with necessary variables like this.issue, this.comment, this.project
    */
    /*make the trackedTime change according to timetracker*/
    this.active = true;
  }

  markBillable() {
    // TODO: update timelog
    this.timeLog.billable = !this.timeLog.billable;
    this.updateTimeLog();
  }

  changeEndTime(time) {
    // TODO: update timelog
    const hours = parseInt(time.split(':')[0], 10);
    const mins = parseInt(time.split(':')[1], 10);
    this.timeLog.timeStopped = new Date(
      this.timeLog.timeStarted.getFullYear(),
      this.timeLog.timeStarted.getMonth(),
      this.timeLog.timeStarted.getDay(),
      hours,
      mins,
      0,
      0
    );
    this.calculateTime();
    this.updateTimeLog();
    this.refreshTrackedTime();
  }

  changeStartTime(time) {
    // TODO: update timelog
    const hours = parseInt(time.split(':')[0], 10);
    const mins = parseInt(time.split(':')[1], 10);
    this.timeLog.timeStarted = new Date(
      this.timeLog.timeStarted.getFullYear(),
      this.timeLog.timeStarted.getMonth(),
      this.timeLog.timeStarted.getDay(),
      hours,
      mins,
      0,
      0
    );
    this.calculateTime();
    this.updateTimeLog();
    this.refreshTrackedTime();
  }

  refreshTrackedTime() {
    // TODO: update timelog
    this.updateTimeLog();
  }

  private isRunning() {
    return this.active;
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
    if (
      !this.timeLog.issue ||
      !this.timeLog.project ||
      this.timeLog.project.name === '' ||
      this.timeLog.issue.subject === ''
    ) {
      this.timeLog.booked = false;
    } else {
      this.timeLog.booked = true;
    }
  }

  changeMode() {
    if (this.isRunning()) {
      /*ERROR: stop the tracker first*/
    }
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
    }
    this.editMode = !this.editMode;
    // TODO: update timelog
    this.updateTimeLog();
  }

  private findProject(project): Project {
    return this.projectOptions.find(entry => entry.id === project.id);
  }

  private findIssue(issue): Issue {
    return this.issueOptions.find(entry => entry.id === issue.id);
  }

  deleteWarning() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      description: 'Delete time log?'
    };

    const dialogRef = this.deleteDialog.open(
      DeleteWarningComponent,
      dialogConfig
    );

    dialogRef
      .afterClosed()
      .subscribe(data =>
        data ? this.deleteTimeLog() : console.log('Do NOT delete')
      );
  }

  deleteTimeLog() {
    this.dataService.deleteTimeLog(this.timeLog).subscribe({
      next(success) { console.log(success); },
      error(msg) { console.log('Error deleting: ', msg); }
    });
  }

  updateTimeLog() {
    this.dataService.updateTimeLog(this.timeLog).subscribe({
      next(success) { console.log(success); },
      error(msg) { console.log('Error deleting: ', msg); }
    });
  }

  blurProject(input) {
    console.log('blurProject' + input);
    let exists = false;
    this.projectOptions.forEach(project => {
      if (!exists) {
        if (input === project.name) {
          exists = true;
        }
      }
    });
    if (exists) {
      this.projectControl.setValue(input);
    } else {
      this.projectControl.setValue('');
    }
  }

  blurIssue(input) {
    console.log('blurIssue' + input);
    let exists = false;
    this.issueOptions.forEach(issue => {
      if (!exists) {
        if (input === issue.subject) {
          exists = true;
        }
      }
    });
    if (exists) {
      this.issueControl.setValue(input);
    } else {
      this.issueControl.setValue('');
    }
  }
}
