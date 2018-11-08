import { Component, OnInit } from '@angular/core';
import { RedmineService } from 'src/app/services/redmine/redmine.service';
import { Project } from 'src/app/model/project.interface';
import { Issue } from 'src/app/model/issue.interface';
import { isUndefined } from 'util';

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss']
})
export class TimeTrackerComponent implements OnInit {

  constructor( private redmineService: RedmineService ) { }

  projects: Project[];
  issues: Issue[];
  selectedIssue: Issue;
  selectedProject: Project;

  ngOnInit() {
    this.loadProjects();
    this.loadIssues();
  }

  selectIssue() {
    console.log(this.selectedIssue);
    if (isUndefined(this.selectedIssue)) {
      this.selectedProject = undefined;
    } else {
      this.selectedProject = this.selectedIssue.project;
      if (!this.projects.includes(this.selectedProject)) {
        this.projects.forEach( project => {
          if (JSON.stringify(project) === JSON.stringify(this.selectedProject)) {
            this.selectedProject = project;
          }
        });
      }
    }
    console.log(this.selectedProject);
  }

  selectProject() {
    console.log(this.selectedProject);
    this.selectedIssue = undefined;
  }

  loadProjects() {
    this.redmineService.getProjects().subscribe(data => {
      this.projects = new Array();
      data.projects.forEach( project => {
        this.projects.push(
          {
            id: project.id,
            name: project.name
          }
        );
      });
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
