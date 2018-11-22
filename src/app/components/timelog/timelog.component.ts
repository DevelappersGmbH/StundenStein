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

    this.issueControl.setValue(this.timeLog.issue ? this.timeLog.issue.subject : '');
    this.projectControl.setValue(this.timeLog.project ? this.timeLog.project.name : '');

    this.loadIssues();
    this.loadProjects();

    this.issueControl.valueChanges.subscribe(
      value => {
        if (value === '') {
          if (this.currentProject && this.currentIssue) {
          this.updateIssueOptions(this.currentProject);
          } else if (this.currentIssue) {
            this.projectControl.setValue('');
          }
          this.projectOptions = this.projects;
          this.currentIssue = null;
        }
      }
    );

    this.projectControl.valueChanges.subscribe(
      value => {
        if (value === '') {
          console.log('Here');
            this.issueOptions = this.issues;
          console.log('Length options: ', this.issueOptions.length);
            this.projectOptions = this.projects;
            this.issueControl.setValue('Dummy value');
            this.issueControl.setValue('');
            this.currentIssue = null;
            this.currentProject = null;
          }
      }
    );

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
  }

  loadProjects() {
    this.dataService.getProjects().subscribe( data => {
      this.projects = data;
      this.projectOptions = this.projects;
    }, error => {
      console.error('Couldn\'t get projects from data service.');
    });
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
    if (!this.isString(value)) { value = value.subject; }
    const filterValue: string = value.toLowerCase().replace('#', '').trim();

    return this.issueOptions.filter(issue =>
      issue.subject.toLowerCase().includes(filterValue) ||
      issue.id.toString().includes(filterValue) ||
      issue.subject.toLowerCase().includes(filterValue.substring(filterValue.lastIndexOf(': ') + 2))
    );
  }

  private filterProjects(value): Project[] {
    if (!this.isString(value)) {
      value = value.name;
      this.filteredObject = true;
    } else {
      this.filteredObject = false;
    }
    const filterValue = value.toLowerCase().replace('#', '').trim();

    return this.projectOptions.filter(project => project.name.toLowerCase().includes(filterValue));
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

  private selectIssue(issue) {
    console.log('Issue: ', issue);

    const newIssue = this.issues.find(
      entry => entry.id === issue.id
    );

    if (newIssue) {
      console.log('Existing issue detected');
      this.currentIssue = newIssue;
      this.currentProject = newIssue.project;
      this.issueControl.setValue(this.currentIssue ? this.currentIssue.subject : '');

      this.updateIssueOptions(this.currentProject);

      this.projectControl.setValue(this.currentProject ? this.currentProject.name : '');
    } else  {
      console.log('No such issue!');
    }
    console.log(this.projectOptions);
  }

  private selectProject(project) {
    const newProject = this.projectOptions.find(entry => entry.id === project.id);
    if (newProject) {
      console.log('New project detected', project);
      this.currentProject = newProject;
      this.projectControl.setValue(project ? project.name : '');
      this.updateIssueOptions(project);
      this.issueControl.setValue('Dummy value');
      this.issueControl.setValue(this.currentIssue ? this.currentIssue.subject : '');
      console.log(this.issueOptions);
    } else {
      console.log('Something went wrong');
    }
  }

  private updateComment(comment) {
    this.currentComment = comment;
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


