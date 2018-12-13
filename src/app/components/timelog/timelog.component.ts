import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { DeleteWarningComponent } from '../delete-warning/delete-warning.component';
import { FormControl } from '@angular/forms';
import { Issue } from '../../model/issue.interface';
import { map, startWith } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Observable } from 'rxjs';
import { Project } from '../../model/project.interface';
import { TimeLog } from '../../model/time-log.interface';
import {ReloadTriggerService} from '../../services/reload-trigger.service';
import {ErrorService} from '../../services/error/error.service';

@Component({
  selector: 'app-timelog',
  templateUrl: './timelog.component.html',
  styleUrls: ['./timelog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimeLogComponent implements OnInit, AfterViewInit {
  constructor(
    private dataService: DataService,
    private deleteDialog: MatDialog,
    private reloadTriggerService: ReloadTriggerService,
    private errorService: ErrorService
  ) {}

  @Input() timeLog: TimeLog;
  @Output() deleted: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('hiddenStart') textStart: ElementRef;
  @ViewChild('hiddenEnd') textEnd: ElementRef;
  minWidth = 45;
  startWidth: number = this.minWidth;
  endWidth: number = this.minWidth;

  isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

  trackedTime: Date;
  active = false;
  editMode = false;
  editButton = 'edit';
  loading = false;
  loadingDel = false;

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
      this.timeLog.timeStarted.getDate(),
      Math.floor(this.timeLog.timeInHours),
      (this.timeLog.timeInHours * 60) % 60,
      0,
      0
    );

    this.issueControl.setValue(
      this.timeLog.issue ? this.timeLog.issue : undefined
    );
    this.projectControl.setValue(
      this.timeLog.project ? this.timeLog.project : undefined
    );

    this.loadIssues();
    this.loadProjects();

    this.filteredIssues = this.issueControl.valueChanges.pipe(
      startWith(''),
      map(issue =>
        issue ? this.filterIssues(issue) : this.issueOptions.slice()
      )
    );

    this.filteredProjects = this.projectControl.valueChanges.pipe(
      startWith(''),
      map(project => project ? this.filterProjects(project) : this.projectOptions.slice())
    );

    if (!this.timeLog.project || this.timeLog.project.name === '') {
      this.editButton = 'playlist_add';
    }
  }

  ngAfterViewInit() {
    this.resizeEnd();
    this.resizeStart();
  }

  loadProjects() {
    this.dataService.getProjects().subscribe(
      data => {
        this.projects = data;
        this.projectOptions = this.projects;
      },
      error => {
        this.errorService.errorDialog('Couldn\'t get projects from data service.');
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
        this.errorService.errorDialog('Couldn\'t get issues from data service.');
      }
    );
  }

  displayIssue(issue: Issue): string {
    if (!issue) { return ''; }
    return issue.id.toString() + ': ' + issue.subject;
  }

  displayProject(project: Project): string {
    if (!project) { return ''; }
    return project.name;
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
        (issue.subject.toLowerCase().includes(filterValue) ||
        issue.id.toString().includes(filterValue) ||
        issue.subject
          .toLowerCase()
          .includes(filterValue.substring(filterValue.lastIndexOf(': ') + 2)))
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

    if (this.findIssue(issue)) {
      this.timeLog.issue = issue;
      this.timeLog.project = issue.project;

      this.issueControl.setValue(
        this.timeLog.issue ? this.timeLog.issue : undefined
      );
      this.updateIssueOptions(this.timeLog.project);

      this.projectControl.setValue(
        this.timeLog.project ? this.timeLog.project : undefined
      );
    } else {
      if (this.timeLog.project && this.timeLog.issue) {
        this.updateIssueOptions(this.timeLog.project);
      } else if (this.timeLog.issue) {
        this.projectControl.setValue(undefined);
      }
      this.projectOptions = this.projects;
      this.timeLog.issue = null;
    }
  }

  selectProject(project) {
    if (this.findProject(project)) {
      this.timeLog.project = project;
      this.projectControl.setValue(project ? project : undefined);
      this.updateIssueOptions(project);
      this.issueControl.setValue(undefined);
      this.timeLog.issue = null;
    } else {
      this.issueOptions = this.issues;
      this.projectOptions = this.projects;
      this.timeLog.issue = null;
      this.timeLog.project = null;
      this.issueControl.setValue(
        this.timeLog.issue ? this.timeLog.issue : undefined
      );
    }
  }

  updateComment(comment) {
    this.timeLog.comment = comment;
  }

  startTracker() {
    /*
    startTracker from timetracker component with necessary variables like this.issue, this.comment, this.project
    */
    /*make the trackedTime change according to timetracker*/
  }

  markBillable() {
    this.timeLog.billable = !this.timeLog.billable;
  }

  changeEndTime(time) {
    const hours = parseInt(time.split(':')[0], 10);
    const mins = parseInt(time.split(':')[1], 10);
    if (!isNaN(hours) && !isNaN(mins)) {
      this.timeLog.timeStopped = new Date(
        this.timeLog.timeStarted.getFullYear(),
        this.timeLog.timeStarted.getMonth(),
        this.timeLog.timeStarted.getDate(),
        hours,
        mins,
        0,
        0
      );
    }
    this.calculateTime();
  }

  changeStartTime(time) {
    const hours = parseInt(time.split(':')[0], 10);
    const mins = parseInt(time.split(':')[1], 10);
    if (!isNaN(hours) && !isNaN(mins)) {
      this.timeLog.timeStarted = new Date(
        this.timeLog.timeStarted.getFullYear(),
        this.timeLog.timeStarted.getMonth(),
        this.timeLog.timeStarted.getDate(),
        hours,
        mins,
        0,
        0
      );
    }
    this.calculateTime();
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
    if (!this.timeLog.project || this.timeLog.project.name === '') {
      this.timeLog.booked = false;
    } else {
      this.timeLog.booked = true;
    }
  }

  changeMode() {
    this.resizeStart();
    this.resizeEnd();
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
      this.updateTimeLog();
    }
    this.editMode = !this.editMode;
  }

  private findProject(project): Project {
    if (project) {
    return this.projectOptions.find(entry => entry.id === project.id);
    }
    return undefined;
  }

  private findIssue(issue): Issue {
    if (issue) {
      return this.issueOptions.find(entry => entry.id === issue.id);
    }
    return undefined;
  }

  deleteWarning() {
    this.loadingDel = true;
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.deleteDialog.open(
      DeleteWarningComponent,
      dialogConfig
    );

    dialogRef
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.deleteTimeLog();
        }
        this.loadingDel = false;
      }
      );
  }

  deleteTimeLog() {
    const that = this;
    this.dataService.deleteTimeLog(this.timeLog).subscribe({
      next() {
        that.reloadTriggerService.triggerTimeLogDeleted(that.timeLog.id);
      },
      error(msg) {
        this.errorService.errorDialog(msg);
      }
    });
  }

  updateTimeLog() {
    const that = this;
    that.loading = true;
    this.dataService.updateTimeLog(this.timeLog).subscribe( {
      next() {
        that.loading = false;
        that.reloadTriggerService.triggerTimeLogUpdated(that.timeLog.id);
      },
      error(msg) {
        this.errorService.errorDialog(msg);
        that.loading = false;
      }
    });
  }

  resizeStart() {
    let newWidth;
    if (this.isFirefox) {
      newWidth = this.textStart.nativeElement.offsetWidth + 30;
    } else {
      newWidth = this.textStart.nativeElement.offsetWidth + 10;
    }
    setTimeout(
      () =>
        (this.startWidth = Math.max(
          this.minWidth,
          newWidth
        ))
    );
  }

  resizeEnd() {
    let newWidth;
    if (this.isFirefox) {
      newWidth = this.textStart.nativeElement.offsetWidth + 30;
    } else {
      newWidth = this.textStart.nativeElement.offsetWidth + 10;
    }
    setTimeout(
      () =>
        (this.endWidth = Math.max(
          this.minWidth,
          newWidth
        ))
    );
  }
}
