import { forkJoin, Observable } from 'rxjs';
import { HourGlassService } from '../hourglass/hourglass.service';
import { Injectable } from '@angular/core';
import { Issue } from 'src/app/model/issue.interface';
import {
  map,
  mapTo,
  switchMap,
  tap
  } from 'rxjs/operators';
import { Project } from 'src/app/model/project.interface';
import { RedmineIssues } from 'src/app/redmine-model/redmine-issues.interface';
import { RedmineProject } from 'src/app/redmine-model/redmine-project.interface';
import { RedmineProjects } from 'src/app/redmine-model/redmine-projects.interface';
import { RedmineService } from '../redmine/redmine.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private cachedProjects: Project[];
  private cachedIssues: Partial<Issue>[];

  constructor(
    private redmineService: RedmineService,
    private hourglassService: HourGlassService
  ) {
    this.cachedProjects = [];
    this.cachedIssues = [];
  }

  getProjects(): Observable<Project[]> {
    return this.redmineService
      .getProjects()
      .pipe(map(p => this.mapRedmineProjectsToProjectArrayAndStore(p)));
  }

  mapRedmineProjectsToProjectArrayAndStore(
    redmineProjects: RedmineProjects
  ): Project[] {
    this.cachedProjects = this.mapRedmineProjectsToProjectArray(
      redmineProjects
    );
    return this.cachedProjects;
  }

  mapRedmineProjectsToProjectArray(
    redmineProjects: RedmineProjects
  ): Project[] {
    const projects: Project[] = [];
    redmineProjects.projects.forEach(project => {
      projects.push(this.mapRedmineProjectToProject(project));
    });
    return projects;
  }

  mapRedmineProjectToProject(redmineProject: RedmineProject): Project {
    return { id: redmineProject.id, name: redmineProject.name };
  }

  getIssues(): Observable<Partial<Issue>[]> {
    const calls: Observable<any>[] = [];
    if (!this.cachedProjects || this.cachedProjects.length === 0) {
      calls.push(this.redmineService.getProjects());
    }
    calls.push(this.redmineService.getIssues());
    return forkJoin(calls).pipe(
      map(results => this.mapRedmineIssuesToIssueArray(results))
    );
  }

  mapRedmineIssuesToIssueArray(results: any[]): Partial<Issue>[] {
    let redmineIssues: RedmineIssues;
    if (!results || results.length === 0) {
      console.error(
        'IssuesConversion: No input parameters, Array is empty or null'
      );
    }
    if (results.length === 1 && !(<RedmineIssues>results[0]).issues) {
      console.error(
        'IssuesConversion the only parameter in Array is not RedmineIssues!'
      );
    } else {
      redmineIssues = results[1];
    }
    if (results.length === 2 && (<RedmineProjects>results[0]).projects) {
      this.cachedProjects = this.mapRedmineProjectsToProjectArray(results[0]);
      redmineIssues = results[1];
    }

    this.cachedIssues = [];
    redmineIssues.issues.forEach(redmineIssue => {
      const issue: Partial<Issue> = {
        id: redmineIssue.id,
        subject: redmineIssue.subject
      };
      if (redmineIssue.assigned_to) {
        issue.assignedTo = redmineIssue.assigned_to;
      }
      if (redmineIssue.tracker) {
        issue.tracker = redmineIssue.tracker.name;
      }
      if (redmineIssue.project) {
        issue.project = this.cachedProjects.find(
          p => p.id === redmineIssue.project.id
        );
      }
      this.cachedIssues.push(issue);
    });
    return this.cachedIssues;
  }
}
