import { HourGlassService } from '../hourglass/hourglass.service';
import { Injectable } from '@angular/core';
import { Issue } from 'src/app/model/issue.interface';
import { map, mapTo, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Project } from 'src/app/model/project.interface';
import { RedmineIssues } from 'src/app/redmine-model/redmine-issue.interface';
import { RedmineProjects } from 'src/app/redmine-model/redmine-projects.interface';
import { RedmineService } from '../redmine/redmine.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private redmineService: RedmineService,
    private hourglassService: HourGlassService
  ) {}

  getProjects(): Observable<Project[]> {
    return this.redmineService
      .getProjects()
      .pipe(map(p => this.mapRedmineProjectsToProjectArray(p)));
  }

  mapRedmineProjectsToProjectArray(
    redmineProjects: RedmineProjects
  ): Project[] {
    const projects: Project[] = [];
    redmineProjects.projects.forEach(project => {
      projects.push({
        id: project.id,
        name: project.name
      });
    });
    return projects;
  }

  getIssues(): Observable<Partial<Issue>[]> {
    return this.redmineService
      .getIssues()
      .pipe(map(p => this.mapRedmineIssuesToIssueArray(p)));
  }

  mapRedmineIssuesToIssueArray(redmineIssues: RedmineIssues): Partial<Issue>[] {
    const issues: Partial<Issue>[] = [];
    redmineIssues.issues.forEach(redmineIssue => {
      const issue: Partial<Issue> = {
        id: redmineIssue.id,
        subject: redmineIssue.subject
      };
      if (redmineIssue.assigned_to) {
        issue.assignedTo = redmineIssue.assigned_to;
      }
      issues.push(issue);
    });
    return issues;
  }
}
