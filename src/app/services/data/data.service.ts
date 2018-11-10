import { forkJoin, Observable } from 'rxjs';
import { HourGlassService } from '../hourglass/hourglass.service';
import { HourGlassTimeTracker } from 'src/app/redmine-model/hourglass-time-tracker.interface';
import { HourGlassTimeTrackers } from 'src/app/redmine-model/hourglass-time-trackers.interface';
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
import { TimeTracker } from 'src/app/model/time-tracker.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private cachedProjects: Project[];
  private cachedIssues: Issue[];

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
        issue.project = this.cachedProjects.find(
          p => p.id === redmineIssue.project.id
        );
      }
      this.cachedIssues.push(issue);
    });
    return this.cachedIssues;
  }

  // *************************************************
  // ******************HourGlass**********************
  // *************************************************

  startTimeTracker(
    issueId: number = null,
    comment: string = null
  ): Observable<TimeTracker> {
    return this.hourglassService
      .startTimeTracker(issueId, comment)
      .pipe(map(t => this.mapHourGlassTimeTrackerToTimeTracker(t)));
  }

  mapHourGlassTimeTrackerToTimeTracker(
    hourglassTimeTracker: HourGlassTimeTracker
  ): TimeTracker {
    const timeTracker: TimeTracker = {
      id: hourglassTimeTracker.id,
      timeStarted: hourglassTimeTracker.start,
      billable: true
    };
    if (hourglassTimeTracker.issue_id) {
      timeTracker.issue = this.cachedIssues.find(
        i => i.id === hourglassTimeTracker.issue_id
      );
    }
    if (hourglassTimeTracker.project_id) {
      timeTracker.project = this.cachedProjects.find(
        p => p.id === hourglassTimeTracker.project_id
      );
    }
    if (hourglassTimeTracker.comments) {
      timeTracker.comment = hourglassTimeTracker.comments;
    }
    return timeTracker;
  }

  getTimeTrackerByUserId(userId: number): Observable<TimeTracker> {
    return this.hourglassService
      .getTimeTrackersByUserId(userId)
      .pipe(map(t => this.mapHourGlassTimeTrackersToFirstTimeTracker(t)));
  }

  mapHourGlassTimeTrackersToFirstTimeTracker(
    hourglassTimeTrackers: HourGlassTimeTrackers
  ): TimeTracker {
    if (hourglassTimeTrackers.records.length === 0) {
      return null;
    }
    return this.mapHourGlassTimeTrackerToTimeTracker(
      hourglassTimeTrackers.records[0]
    );
  }
}
