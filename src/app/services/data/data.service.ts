import {
  flatMap,
  map,
  mapTo,
  switchMap,
  tap
  } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { HourGlassService } from '../hourglass/hourglass.service';
import { HourGlassTimeBooking } from 'src/app/redmine-model/hourglass-time-booking.interface';
import { HourGlassTimeLog } from 'src/app/redmine-model/hourglass-time-log.interface';
import { HourGlassTimeTracker } from 'src/app/redmine-model/hourglass-time-tracker.interface';
import { HourGlassTimeTrackers } from 'src/app/redmine-model/hourglass-time-trackers.interface';
import { Injectable } from '@angular/core';
import { Issue } from 'src/app/model/issue.interface';
import { Project } from 'src/app/model/project.interface';
import { RedmineIssues } from 'src/app/redmine-model/redmine-issues.interface';
import { RedmineProject } from 'src/app/redmine-model/redmine-project.interface';
import { RedmineProjects } from 'src/app/redmine-model/redmine-projects.interface';
import { RedmineService } from '../redmine/redmine.service';
import { RedmineTimeEntryActivities } from 'src/app/redmine-model/redmine-time-entry-activities.interface';
import { RedmineTimeEntryActivity } from 'src/app/redmine-model/redmine-time-entry-activity.interface';
import { TimeLog } from 'src/app/model/time-log.interface';
import { TimeTracker } from 'src/app/model/time-tracker.interface';
import { User } from 'src/app/model/user.interface';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private cachedProjects: Project[];
  private cachedIssues: Issue[];

  constructor(
    private redmineService: RedmineService,
    private hourglassService: HourGlassService,
    private userService: UserService
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
    return {
      id: redmineProject.id,
      name: redmineProject.name,
      color: '#123456'
    };
  }

  getIssues(): Observable<Issue[]> {
    const calls: Observable<any>[] = [];
    if (!this.cachedProjects || this.cachedProjects.length === 0) {
      calls.push(this.redmineService.getProjects());
    }
    calls.push(this.redmineService.getIssues());
    return forkJoin(calls).pipe(
      map(results => this.mapRedmineIssuesToIssueArrayAndStore(results))
    );
  }

  mapRedmineIssuesToIssueArrayAndStore(results: any[]): Issue[] {
    this.cachedIssues = this.mapRedmineIssuesToIssueArray(results);
    return this.cachedIssues;
  }

  mapRedmineIssuesToIssueArray(results: any[]): Issue[] {
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

    const issues = [];
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
      issues.push(issue);
    });
    return issues;
  }

  // *************************************************
  // ******************HourGlass**********************
  // *************************************************

  startTimeTracker(timeTracker: Partial<TimeTracker>): Observable<TimeTracker> {
    const calls: Observable<any>[] = [
      this.redmineService.getTimeEntryActivities(),
      this.redmineService.getIssues()
    ];
    return forkJoin(calls).pipe(
      flatMap(results => {
        return this.hourglassService
          .startTimeTracker(
            this.mapPartialTimeTrackerToPartialHourGlassTimeTracker(
              timeTracker,
              results[0]
            )
          )
          .pipe(
            map(t =>
              this.mapHourGlassTimeTrackerToTimeTracker(t, {
                time_entry_activities: []
              })
            )
          );
      })
    );
  }

  stopTimeTracker(timeTracker: TimeTracker): Observable<boolean> {
    return this.hourglassService.stopTimeTracker(timeTracker.id).pipe(
      map(hgTimeTrackerStopResponse => {
        if (hgTimeTrackerStopResponse.time_log) {
          return true;
        }
        return false;
      })
    );
  }

  mapPartialTimeTrackerToPartialHourGlassTimeTracker(
    timeTracker: Partial<TimeTracker>,
    redmineTimeEntryActivities: RedmineTimeEntryActivities
  ): Partial<HourGlassTimeTracker> {
    const hgtracker: Partial<HourGlassTimeTracker> = {
      comments: timeTracker.comment,
      issue_id: timeTracker.issue ? timeTracker.issue.id : undefined,
      project_id: timeTracker.project ? timeTracker.project.id : undefined,
      id: timeTracker.id ? timeTracker.id : undefined,
      activity_id: this.mapBillableToRedmineTimeEntryActivityId(
        timeTracker.billable,
        redmineTimeEntryActivities
      )
    };
    return hgtracker;
  }

  mapBillableToRedmineTimeEntryActivityId(
    value: boolean,
    redmineTimeEntryActivities: RedmineTimeEntryActivities
  ): number {
    return value
      ? redmineTimeEntryActivities.time_entry_activities.find(
          entry => entry.name === 'Billable'
        ).id
      : redmineTimeEntryActivities.time_entry_activities.find(
          entry => entry.name === 'Non billable'
        ).id;
  }

  mapHourGlassTimeTrackerToTimeTracker(
    hourglassTimeTracker: HourGlassTimeTracker,
    redmineTimeEntryActivities: RedmineTimeEntryActivities
  ): TimeTracker {
    const timeTracker: TimeTracker = {
      id: hourglassTimeTracker.id,
      timeStarted: new Date(hourglassTimeTracker.start),
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
    if (
      hourglassTimeTracker.activity_id &&
      redmineTimeEntryActivities.time_entry_activities.length > 0
    ) {
      timeTracker.billable = this.mapRedmineTimeEntryActivityToBillable(
        hourglassTimeTracker.activity_id,
        redmineTimeEntryActivities
      );
    }
    return timeTracker;
  }

  mapRedmineTimeEntryActivityToBillable(
    id: number,
    redmineTimeEntryActivities: RedmineTimeEntryActivities
  ): boolean {
    const activity: RedmineTimeEntryActivity = redmineTimeEntryActivities.time_entry_activities.find(
      a => a.id === id
    );
    if (!activity) {
      return false;
    }
    return activity.name === 'Billable';
  }

  getTimeTrackerByUserId(userId: number): Observable<TimeTracker> {
    const calls: Observable<any>[] = [
      this.hourglassService.getTimeTrackersByUserId(userId),
      this.redmineService.getTimeEntryActivities()
    ];
    return forkJoin(calls).pipe(
      map(results => {
        if (results.length === 0) {
          console.error(
            'DataService: getTimeTrackerByUserId got no parameter!'
          );
        }
        const hourGlassTimeTrackers: HourGlassTimeTrackers = results.find(
          item =>
            (<HourGlassTimeTrackers>item).records !== undefined &&
            (<HourGlassTimeTrackers>item).records !== null
        );
        const redmineTimeEntryActivities: RedmineTimeEntryActivities = results.find(
          item =>
            (<RedmineTimeEntryActivities>item).time_entry_activities !==
              undefined &&
            (<RedmineTimeEntryActivities>item).time_entry_activities !== null
        );
        return this.mapHourGlassTimeTrackersToFirstTimeTracker(
          hourGlassTimeTrackers,
          redmineTimeEntryActivities
        );
      })
    );
  }

  mapHourGlassTimeTrackersToFirstTimeTracker(
    hourglassTimeTrackers: HourGlassTimeTrackers,
    redmineTimeEntryActivities: RedmineTimeEntryActivities
  ): TimeTracker {
    if (hourglassTimeTrackers.records.length === 0) {
      return null;
    }
    return this.mapHourGlassTimeTrackerToTimeTracker(
      hourglassTimeTrackers.records[0],
      redmineTimeEntryActivities
    );
  }

  getTimeLogs(userId: number = -1): Observable<TimeLog[]> {
    const calls: Observable<any>[] = [
      this.hourglassService.getTimeLogs(userId),
      this.hourglassService.getTimeBookings(userId),
      this.redmineService.getTimeEntryActivities(),
      this.redmineService.getProjects(),
      this.redmineService.getIssues()
    ];
    return forkJoin(calls).pipe(
      map(results => {
        const timelogs: TimeLog[] = [];
        const hourglassTimeLogs: HourGlassTimeLog[] = results[0];
        const hourglassTimeBookings: HourGlassTimeBooking[] = results[1];
        const redmineTimeEntryActivities: RedmineTimeEntryActivities =
          results[2];
        hourglassTimeBookings.forEach(hgbooking => {
          timelogs.push({
            id: hgbooking.time_log_id,
            hourGlassTimeBookingId: hgbooking.id,
            billable: this.mapRedmineTimeEntryActivityToBillable(
              hgbooking.time_entry.activity_id,
              redmineTimeEntryActivities
            ),
            booked: true,
            comment: hgbooking.time_entry.comments,
            timeStarted: new Date(hgbooking.start),
            timeStopped: new Date(hgbooking.stop),
            timeInHours: hgbooking.time_entry.hours,
            project: this.cachedProjects.find(
              entry => entry.id === hgbooking.time_entry.project_id
            ),
            issue: this.cachedIssues.find(
              entry => entry.id === hgbooking.time_entry.issue_id
            ),
            user: this.mapRedmineUserIdToCurrentUserOrNull(
              hgbooking.time_entry.user_id
            )
          });
        });
        hourglassTimeLogs.forEach(hglog => {
          if (timelogs.findIndex(entry => entry.id === hglog.id) === -1) {
            timelogs.push({
              id: hglog.id,
              billable: true,
              booked: false,
              comment: hglog.comments,
              hourGlassTimeBookingId: null,
              issue: null,
              project: null,
              timeStarted: new Date(hglog.start),
              timeStopped: new Date(hglog.stop),
              timeInHours: hglog.hours,
              user: this.mapRedmineUserIdToCurrentUserOrNull(hglog.user_id)
            });
          }
        });
        return timelogs.sort((a, b) => {
          return <any>new Date(a.timeStarted) - <any>new Date(b.timeStopped);
        });
      })
    );
  }

  mapRedmineUserIdToCurrentUserOrNull(userId: number): User {
    return userId === this.userService.getUser().id
      ? this.userService.getUser()
      : null;
  }
}
