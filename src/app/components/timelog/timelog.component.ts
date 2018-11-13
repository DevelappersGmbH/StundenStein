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
export class TimelogComponent implements OnInit {

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

    console.log(this.issueOptions);

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
      this.projects.forEach(project => {
        this.projectOptions.push(project.name);
      });
    }, error => {
      console.error('Couldn\'t get projects from data service.');
    });
  }

  loadIssues() {
    this.dataService.getIssues().subscribe( data => {
      this.issues = data;
      this.issues.forEach(issue => {
        this.issueOptions.push(issue.subject);
      });
    }, error => {
      console.error('Couldn\'t get issues from data service.');
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
    /*
    get the record with current issue from Redmine
    send issue to the Redmine
    change current issue value to new

    ??? the same to Hourglass?
    */
    this.currentIssueSubject = issue;
  }

  private updateProject(project) {
    /*
    get the record with current issue from Redmine
    send project of this issue to the Redmine
    change current project value to new

    ??? the same to Hourglass?
    */
    this.currentProjectName = project;
  }


  private updateComment(comment) {
    /*
    get the record with current issue from Hourglass
    send comment to this issue to the Hourglass
    change current comment value to new
    */
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

  private isBooked() {
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
      this.isBooked();
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

