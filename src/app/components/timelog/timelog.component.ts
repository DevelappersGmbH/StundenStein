import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {DataService} from '../../services/data/data.service';
import {Issue} from '../../model/issue.interface';
import {Project} from '../../model/project.interface';

@Component({
  selector: 'app-timelog',
  templateUrl: './timelog.component.html',
  styleUrls: ['./timelog.component.scss']
})
export class TimelogComponent implements OnInit {

  constructor(
    private dataService: DataService
  ) { }

  currentIssue = '';
  currentProject = '';
  currentComment = '';
  startTime = '00:00';
  endTime = '00:00';
  billable = false;
  active = false;
  trackedTime: any;
  editMode = false;
  booked = false;
  editButton = 'edit';

  projects: Project[];
  issues: Partial<Issue>[];

  issueControl = new FormControl();
  projectControl = new FormControl();
  issueOptions: string[] = []; // load options from Redmine
  projectOptions: string[] = []; // load options from Redmine
  filteredIssueOptions: Observable<string[]>;
  filteredProjectOptions: Observable<string[]>;


  ngOnInit() {
    this.trackedTime = new Date();

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
    this.currentIssue = issue;
  }

  private updateProject(project) {
    /*
    get the record with current issue from Redmine
    send project of this issue to the Redmine
    change current project value to new

    ??? the same to Hourglass?
    */
    this.currentProject = project;
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
    /*make the button green and not clickable*/
    this.active = true;
  }

  private markBillable() {
    /*
    send billable sign to TimeTracker
    */
    /*make the button green*/

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
    if (this.active === true) {
      return true;
    } else {
      return false;
    }
  }

  private calculateTime() {
    /*
    recalculate trackedTime according to endTime - startTime
    */
  }

  private isBooked() {
    if (this.booked === false) {
      if (this.currentIssue === '' || this.currentProject === '') {
      } else {
        this.booked = true;
      }

    }
    /* if issue and project filled in set booked = true*/
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

