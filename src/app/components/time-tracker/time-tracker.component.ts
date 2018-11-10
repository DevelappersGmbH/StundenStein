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

  constructor( ) { }

  projects: Project[];
  issues: Issue[];
  selectedIssue: Issue;
  selectedProject: Project;
  taskDescription: string;
  currentTrackerTimeString: string;
  automaticMode: boolean;
  automaticLock: boolean;

  ngOnInit() {
    this.loadProjects();
    this.loadIssues();
    this.currentTrackerTimeString  = '00:00:00';
    this.automaticMode = true;
    // Block manual mode until implemented
    this.automaticLock = true;
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
    this.projects = new Array();
    this.projects.push(
      {
        id: 0,
        name: 'Projekt I'
      }
    );
    this.projects.push(
      {
        id: 1,
        name: 'Projekt II'
      }
    );
    console.log(this.projects);
  }

  loadIssues() {
    this.issues = new Array();
    this.issues.push(
      {
        id: 0,
        subject: 'Schriftart umstellen',
        project: {
          id: 1,
          name: 'Projekt II'
        },
        tracker: 'feature',
        assignedTo: {
          id: 0,
          name: 'Jakob Neumann'
        }
      }
    );
  }

}
