import { ColorService } from 'src/app/services/color/color.service';
import { Injectable } from '@angular/core';
import { Issue } from '../issue.interface';
import { Project } from '../project.interface';
import { RedmineIssue } from 'src/app/redmine-model/redmine-issue.interface';
import { RedmineProject } from 'src/app/redmine-model/redmine-project.interface';

@Injectable({
  providedIn: 'root'
})
export class RedmineMapper {
  constructor(private colorService: ColorService) {}

  mapRedmineProjectArrayToProjectArray(
    redmineProjects: RedmineProject[]
  ): Project[] {
    const projects: Project[] = [];
    redmineProjects.forEach(project => {
      projects.push(this.mapRedmineProjectToProject(project));
    });
    return projects;
  }

  mapRedmineProjectToProject(redmineProject: RedmineProject): Project {
    return {
      id: redmineProject.id,
      name: redmineProject.name,
      color: this.colorService.getColor(redmineProject.identifier)
    };
  }

  mapRedmineIssueArrayToIssueArray(
    redmineIssues: RedmineIssue[],
    projects: Project[]
  ): Issue[] {
    const issues = [];
    redmineIssues.forEach(redmineIssue => {
      const issue: Issue = {
        id: redmineIssue.id,
        subject: redmineIssue.subject,
        assignedTo: null,
        project: null,
        tracker: null
      };
      if (redmineIssue.assigned_to) {
        issue.assignedTo = redmineIssue.assigned_to;
      }
      if (redmineIssue.tracker) {
        issue.tracker = redmineIssue.tracker.name;
      }
      if (redmineIssue.project) {
        issue.project = projects.find(p => p.id === redmineIssue.project.id);
      }
      issues.push(issue);
    });
    return issues;
  }
}
