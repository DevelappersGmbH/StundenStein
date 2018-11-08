import { Component, OnInit } from '@angular/core';
import { RedmineService } from 'src/app/services/redmine/redmine.service';
import { Project } from 'src/app/model/project.interface';
import { Issue } from 'src/app/model/issue.interface';

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss']
})
export class TimeTrackerComponent implements OnInit {

  constructor( private redmineService: RedmineService ) { }

  projects: Project[];
  issues: Issue[];

  ngOnInit() {
    this.loadProjects();
    this.loadIssues();
  }

  loadProjects() {
    this.redmineService.getProjects().subscribe(data => {
      this.projects = data.projects;
    }, error => {
      console.error(error);
    });
  }

  loadIssues() {
    this.redmineService.getIssues().subscribe(data => {
      this.issues = new Array();
      data.issues.forEach( issue => {
        this.issues.push(
          {
            id: issue.id,
            subject: issue.subject,
            project: issue.project,
            tracker: issue.tracker.name,
            assignedTo: issue.assigned_to
          }
        );
      });
    }, error => {
      console.error(error);
    });
  }

}
