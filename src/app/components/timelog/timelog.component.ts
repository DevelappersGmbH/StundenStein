import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {DataService} from '../../services/data/data.service';
import {Issue} from '../../model/issue.interface';
import {Project} from '../../model/project.interface';
import {TimeLog} from '../../model/time-log.interface';
import {User} from '../../model/user.interface';

@Component({
  selector: 'app-timelog',
  templateUrl: './timelog.component.html',
  styleUrls: ['./timelog.component.scss']
})
export class TimeLogComponent implements OnInit {

  constructor(
    private dataService: DataService
  ) { }

  @Input() timeLog: TimeLog;

  currentIssueSubject = this.timeLog.issue.subject;
  currentProjectName = this.timeLog.project.name;
  currentIssue: Issue = this.timeLog.issue;
  currentProject: Project = this.timeLog.project;
  currentComment = this.timeLog.comment;
  startTime = this.timeLog.timeStarted;
  endTime = this.timeLog.timeStopped;
  billable = this.timeLog.billable;
  trackedTime = this.timeLog.timeInHours; // why in hours?
  booked = this.timeLog.booked;
  currentUser: User = this.timeLog.user;
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

    this.loadIssues();
    this.loadProjects();

    this.filteredIssueOptions = this.issueControl.valueChanges
      .pipe(
        startWith(''),
        map(value => value ? this.filterIssues(value) : this.issueOptions.slice())
      );

    this.filteredProjectOptions = this.projectControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filterProjects(value))
      );
  }

  loadProjects() {
    this.dataService.getProjects().subscribe( data => {
      this.projects = data;
      this.loadProjectOptions();
    }, error => {
      console.error('Couldn\'t get projects from data service.');
    });
  }

  loadIssues() {
    this.dataService.getIssues().subscribe( data => {
      this.issues = data;
      this.loadIssueOptions();
    }, error => {
      console.error('Couldn\'t get issues from data service.');
    });
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

  private filterIssues(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.issueOptions.filter(issue => issue.toLowerCase().includes(filterValue));
  }

  private filterProjects(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.projectOptions.filter(project => project.toLowerCase().includes(filterValue));
  }

  private updateIssue(issue) {
    console.log('Issue: ', issue);
    this.currentIssueSubject = issue;

    const newIssue = this.issues.find(entry => entry.subject === issue);
    if (newIssue) {
      this.currentIssue = newIssue;
      this.currentProject = newIssue.project;
      this.currentProjectName = newIssue.project.name;

      this.updateProject(this.currentProjectName);

      this.projectOptions.length = 0;
      this.projectOptions.push(this.currentProjectName);

      this.projectControl.setValue(this.currentProjectName);

    } else if (issue === '') {
      this.loadIssueOptions();
      this.loadProjectOptions();
    } else {
      // create a new Timelog entry with new issue value
    }
    console.log(this.projectOptions);

  }

  private updateProject(project) {
    console.log('Project :', project);
    this.currentProjectName = project;
    this.issueOptions.length = 0;
    if (project === '') {
      this.loadIssueOptions();
    } else {
      this.issues.forEach(issue => {
        if (issue.project.name === project) {
          this.issueOptions.push(issue.subject);
        }
      });
    }
    console.log(this.projectOptions);
  }


  private updateComment(comment) {
    this.currentComment = comment;
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

  private changeEndTime() {
    /*
    send to TimeTracker notice about changing end time
    refresh trackedTime
    */
  }

  private changeStartTime() {
    /*
    send to TimeTracker notice about changing start time
    refresh trackedTime
    */
  }

  private refreshTrackedTime() {
    /*
    get from TimeTracker tracked time for this record
    */
  }

  private isRunning() {
    return this.active;
  }

  private calculateTime() {
    /*
    recalculate trackedTime according to endTime - startTime
    */
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
}

