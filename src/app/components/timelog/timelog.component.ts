import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { FormControl } from '@angular/forms';
import { Issue } from '../../model/issue.interface';
import { map, startWith } from 'rxjs/operators';
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
  constructor(private dataService: DataService) {}

  @Input() timeLog: TimeLog;

  currentColor = 'red';
  currentIssueSubject: string;
  currentProjectName: string;
  currentIssue: Issue;
  currentProject: Project;
  currentComment: string;
  startTime: Date;
  endTime: Date;
  billable: boolean;
  trackedTime: Date;
  booked: boolean;
  currentUser: User;
  active = false;
  editMode = false;
  editButton = 'edit';

  projects: Project[];
  issues: Partial<Issue>[];

  issueControl = new FormControl();
  projectControl = new FormControl();
  issueOptions: string[] = [];
  projectOptions: string[] = [];
  filteredIssueOptions: Observable<string[]>;
  filteredProjectOptions: Observable<string[]>;

  ngOnInit() {
    this.currentIssueSubject = this.timeLog.issue ? this.timeLog.issue.subject : '';
    this.currentProjectName = this.timeLog.project ? this.timeLog.project.name : '';
    this.currentIssue = this.timeLog.issue;
    this.currentProject = this.timeLog.project;
    this.currentComment = this.timeLog.comment;
    this.startTime = this.timeLog.timeStarted;
    this.endTime = this.timeLog.timeStopped;
    this.billable = this.timeLog.billable;
    this.trackedTime = new Date(
      1,
      1,
      1,
      Math.floor(this.timeLog.timeInHours),
      (this.timeLog.timeInHours * 60) % 60,
      0,
      0
    );
    this.booked = this.timeLog.booked;
    this.currentUser = this.timeLog.user;

    this.issueControl.setValue(this.currentIssueSubject);
    this.projectControl.setValue(this.currentProjectName);

    this.loadIssues();
    this.loadProjects();

/*    this.issueControl.valueChanges.subscribe(
      value => {
        if (value === '') {
          this.loadIssueOptions();
        }
      }
    );*/

    this.filteredIssueOptions = this.issueControl.valueChanges.pipe(
      startWith(''),
      map(value =>
        value ? this.filterIssues(value) : this.issueOptions.slice()
      )
    );

    this.filteredProjectOptions = this.projectControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterProjects(value))
    );
  }

  private filterIssues(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.issueOptions.filter(issue =>
      issue.toLowerCase().includes(filterValue)
    );
  }

  private filterProjects(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.projectOptions.filter(project =>
      project.toLowerCase().includes(filterValue)
    );
  }

  loadProjects() {
    this.dataService.getProjects().subscribe(
      data => {
        this.projects = data;
        this.loadProjectOptions();
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
        this.loadIssueOptions();
      },
      error => {
        console.error('Couldn\'t get issues from data service.');
      }
    );
  }

  loadIssueOptions() {
    this.issues.forEach(issue => {
      this.issueOptions.push(issue.subject);
    });
  }

  loadProjectOptions() {
    this.projects.forEach(project => {
      this.projectOptions.push(project.name);
    });
  }

  private updateIssue(issue) {
    console.log('Issue: ', issue);

    const newIssue = this.issues.find(
      entry => entry.subject === issue
    ) as Issue; // anything better?

    if (newIssue) {
      this.currentIssueSubject = issue;
      this.currentIssue = newIssue;
      this.currentProject = newIssue.project;
      this.currentProjectName = newIssue.project.name;

      this.updateProject(this.currentProjectName);

      this.projectOptions.length = 0;
      this.projectOptions.push(this.currentProjectName);

      this.projectControl.setValue(this.currentProjectName);
    } else {
      console.log('Something went wrong');
    }
    console.log(this.projectOptions);
  }

  private updateProject(project) {
    console.log('Project :', project);
    const newProject = this.projects.find(entry => entry.name === project);
    this.issueOptions.length = 0;
    if (newProject) {
      console.log('New project detected');
      this.currentProject = newProject;
      this.currentProjectName = project;
      console.log('Project name: ', project);
      this.issues.forEach(issue => {
        if (issue.project.name === project) {
          this.issueOptions.push(issue.subject);
        }
        this.issueControl.setValue('Dummy value');
        this.issueControl.setValue(this.currentIssueSubject);
      });
      console.log(this.issueOptions);
    } else {
      console.log('Something went wrong');
    }
    console.log(this.projectOptions);
  }

  private updateComment(comment) {
    this.currentComment = comment;
  }

  private updateForm() {
    console.log('OnSelectionChange');
  }

  private startTracker() {
    /*
    startTracker from timetracker component with necessary variables like this.issue, this.comment, this.project
    */
    /*make the trackedTime change according to timetracker*/
    this.active = true;
  }

  private markBillable() {
    /*
    send billable sign to TimeTracker
    */
    this.billable = !this.billable;
  }

  private changeEndTime(time) {
    this.endTime = time;
    this.calculateTime();
    this.refreshTrackedTime();
  }

  private changeStartTime(time) {
    this.startTime = time;
    this.calculateTime();
    this.refreshTrackedTime();
  }

  private refreshTrackedTime() {
    // send tracked time to TimeTracker?
  }

  private isRunning() {
    return this.active;
  }

  private calculateTime() {
    // this.trackedTime = this.endTime - this.startTime;
  }

  private toBooked() {
    if (this.booked === false) {
      if (this.currentIssueSubject === '' || this.currentProjectName === '') {
      } else {
        this.booked = true;
      }
    }
  }

  private changeMode() {
    if (this.isRunning()) {
      /*ERROR: stop the tracker first*/
    }
    if (this.editMode === false) {
      /*change button to "accept", everything editable*/
      this.editButton = 'done';
    } else {
      this.toBooked();
      if (this.booked === false) {
        /*change button to "ACHTUNG!", issue, comment, project, billable, end/start time uneditable*/
        this.editButton = 'assignment';
      } else {
        /* change button to "edit", issue, comment, project, billable, end/start time uneditable*/
        this.editButton = 'edit';
      }
    }
    this.editMode = !this.editMode;
  }

  private blurProject (input) {
    console.log('blur' + input);
    /*if (input === '') {
      this.projectOptions.length = 0;
      if (this.currentIssueSubject !== '') {
        this.currentProjectName = this.currentIssue.project.name;
      } else {
        this.currentProjectName = '';
        this.currentProject = undefined;
        this.loadProjectOptions();
      }
    } else {
      console.log('Please select a project');
    }*/
  }
}

/*  private blurIssue (input) {
    if (input === '') {
      this.issueOptions.length = 0;
      this.currentIssueSubject = '';
      this.currentIssue = undefined;
      if (this.currentProjectName !== '') {
        this.issues.forEach(issue => {
          if (issue.project.name === this.currentProjectName) {
            this.issueOptions.push(issue.subject);
          }
          this.loadIssueOptions();
        });
      } else {
        this.loadIssueOptions();
      }
    } else {
      console.log('Please select an issue');
    }
  }*/


