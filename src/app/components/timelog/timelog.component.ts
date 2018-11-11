import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.css']
})
export class TimelogComponent implements OnInit {
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

  issueControl = new FormControl();
  projectControl = new FormControl();
  issueOptions: string[] = ['One', 'Two', 'Three']; // load options from Redmine
  projectOptions: string[] = ['Project Software', 'Bowling', 'Rechnerarchitektur']; // load options from Redmine
  filteredIssueOptions: Observable<string[]>;
  filteredProjectOptions: Observable<string[]>;
  constructor() { }

  ngOnInit() {
    this.trackedTime = new Date();
    this.filteredIssueOptions = this.issueControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filterIssues(value))
      );

    this.filteredProjectOptions = this.projectControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filterProjects(value))
      );
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

