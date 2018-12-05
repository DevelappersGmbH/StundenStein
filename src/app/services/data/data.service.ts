import { ColorService } from '../color/color.service';
import { environment } from 'src/environments/environment';
import { flatMap, map, share } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { HourGlassService } from '../hourglass/hourglass.service';
import { HourGlassTimeBooking } from 'src/app/redmine-model/hourglass-time-booking.interface';
import { HourGlassTimeLog } from 'src/app/redmine-model/hourglass-time-log.interface';
import { HourGlassTimeLogRequest } from 'src/app/redmine-model/requests/hourglass-time-log-request.interface';
import { HourGlassTimeTracker } from 'src/app/redmine-model/hourglass-time-tracker.interface';
import { HourGlassTimeTrackers } from 'src/app/redmine-model/hourglass-time-trackers.interface';
import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Issue } from 'src/app/model/issue.interface';
import { Project } from 'src/app/model/project.interface';
import { RedmineIssue } from 'src/app/redmine-model/redmine-issue.interface';
import { RedmineProject } from 'src/app/redmine-model/redmine-project.interface';
import { RedmineService } from '../redmine/redmine.service';
import { RedmineTimeEntryActivities } from 'src/app/redmine-model/redmine-time-entry-activities.interface';
import { RedmineTimeEntryActivity } from 'src/app/redmine-model/redmine-time-entry-activity.interface';
import { RedmineTimeEntryRequest } from 'src/app/redmine-model/requests/redmine-time-entry-request.interface';
import { TimeLog } from 'src/app/model/time-log.interface';
import { TimeTracker } from 'src/app/model/time-tracker.interface';
import { User } from 'src/app/model/user.interface';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private projects: Project[];
  private projectsRecentlyCached: Date;
  private projectsObservable: Observable<Project[]>;

  private issues: Issue[];
  private issuesRecentlyCached: Date;
  private issuesObservable: Observable<Issue[]>;

  constructor(
    private redmineService: RedmineService,
    private hourglassService: HourGlassService,
    private userService: UserService,
    private colorService: ColorService
  ) {
    this.projects = [];
    this.projectsRecentlyCached = new Date(0);
    this.issues = [];
    this.issuesRecentlyCached = new Date(0);
  }

  getProjects(): Observable<Project[]> {
    const timeDifferenceInMin =
      (new Date().valueOf() - this.projectsRecentlyCached.valueOf()) / 60000;
    const expired = timeDifferenceInMin > environment.projectsExpireAfterMin;
    if (this.projects && this.projects.length > 0 && !expired) {
      return of(this.projects);
    } else if (this.projectsObservable && !expired) {
      return this.projectsObservable;
    } else {
      this.projectsObservable = this.redmineService.getProjects().pipe(
        map(data => {
          this.projects = this.mapRedmineProjectArrayToProjectArray(data);
          this.projectsObservable = null;
          this.projectsRecentlyCached = new Date();
          return this.projects;
        }),
        share()
      );
      return this.projectsObservable;
    }
  }

  getIssues(): Observable<Issue[]> {
    const timeDifferenceInMin =
      (new Date().valueOf() - this.issuesRecentlyCached.valueOf()) / 60000;
    const expired = timeDifferenceInMin > environment.issuesExpireAfterMin;
    console.log(expired);
    if (this.issues && this.issues.length > 0 && !expired) {
      console.log('returning cached data');
      return of(this.issues);
    } else if (this.issuesObservable && !expired) {
      return this.issuesObservable;
    } else {
      const calls: Observable<any>[] = [
        this.redmineService.getIssues(),
        this.getProjects()
      ];
      this.issuesObservable = forkJoin(calls).pipe(
        map(results => {
          this.issues = this.mapRedmineIssueArrayToIssueArray(
            results[0],
            results[1]
          );
          this.issuesObservable = null;
          this.issuesRecentlyCached = new Date();
          return this.issues;
        }),
        share()
      );
      return this.issuesObservable;
    }
  }

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

  updateTimeTracker(timeTracker: TimeTracker): Observable<TimeTracker> {
    const calls: Observable<any>[] = [
      this.redmineService.getTimeEntryActivities(),
      this.redmineService.getIssues()
    ];
    return forkJoin(calls).pipe(
      flatMap(results => {
        return this.hourglassService
          .updateTimeTracker(
            this.mapTimeTrackerToHourGlassTimeTracker(timeTracker, results[0])
          )
          .pipe(
            flatMap(r => {
              return this.getTimeTrackerByUserId(this.userService.getUser().id);
            })
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

  mapTimeTrackerToHourGlassTimeTracker(
    timeTracker: TimeTracker,
    redmineTimeEntryActivities: RedmineTimeEntryActivities
  ): HourGlassTimeTracker {
    const hgtracker: HourGlassTimeTracker = {
      id: timeTracker.id,
      user_id: this.userService.getUser().id,
      start: timeTracker.timeStarted.toISOString(),
      activity_id: this.mapBillableToRedmineTimeEntryActivityId(
        timeTracker.billable,
        redmineTimeEntryActivities
      ),
      comments: timeTracker.comment,
      issue_id:
        timeTracker.issue && timeTracker.issue.id ? timeTracker.issue.id : null,
      project_id:
        timeTracker.project && timeTracker.project.id
          ? timeTracker.project.id
          : null
    };
    return hgtracker;
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
      timeTracker.issue = this.issues.find(
        i => i.id === hourglassTimeTracker.issue_id
      );
    }
    if (hourglassTimeTracker.project_id) {
      timeTracker.project = this.projects.find(
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
            project: this.projects.find(
              entry => entry.id === hgbooking.time_entry.project_id
            ),
            issue: this.issues.find(
              entry => entry.id === hgbooking.time_entry.issue_id
            ),
            user: this.mapRedmineUserIdToCurrentUserOrNull(
              hgbooking.time_entry.user_id
            ),
            redmineTimeEntryId: hgbooking.time_entry_id
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
              user: this.mapRedmineUserIdToCurrentUserOrNull(hglog.user_id),
              redmineTimeEntryId: null
            });
          }
        });
        return timelogs.sort((a, b) => {
          return <any>new Date(a.timeStarted) - <any>new Date(b.timeStopped);
        });
      })
    );
  }

  deleteTimeLog(timeLog: TimeLog): Observable<boolean> {
    return this.hourglassService.deleteTimeLog(timeLog.id).pipe(
      map(response => {
        return response.status === 204;
      })
    );
  }

  mapRedmineUserIdToCurrentUserOrNull(userId: number): User {
    return userId === this.userService.getUser().id
      ? this.userService.getUser()
      : null;
  }

  updateTimeLog(timelog: TimeLog): Observable<boolean> {
    this.redmineService.getTimeEntryActivities().pipe(
      flatMap(timeEntryActivities => {
        console.log(timeEntryActivities);

        const hgLog: HourGlassTimeLog = {
          id: timelog.id,
          comments: timelog.comment,
          start: timelog.timeStarted.toISOString(),
          stop: timelog.timeStopped.toISOString(),
          hours: timelog.timeInHours,
          user_id: this.userService.getUser().id
        };
        const timeLogRequest: HourGlassTimeLogRequest = {
          time_log: hgLog
        };
        const calls: Observable<HttpResponse<any>>[] = [
          this.hourglassService.updateTimeLog(timeLogRequest)
        ];
        if (timelog.redmineTimeEntryId && timelog.redmineTimeEntryId != null) {
          const timeEntryRequest: RedmineTimeEntryRequest = {
            time_entry: {
              id: timelog.redmineTimeEntryId,
              comments: timelog.comment,
              spent_on: timelog.timeStarted.toISOString(),
              activity_id: this.mapBillableToRedmineTimeEntryActivityId(
                timelog.billable,
                timeEntryActivities
              ),
              issue_id:
                timelog.issue && timelog.issue.id ? timelog.issue.id : null,
              project_id:
                timelog.project && timelog.project.id
                  ? timelog.project.id
                  : null,
              hours: timelog.timeInHours
            }
          };
          calls.push(this.redmineService.updateTimeEntry(timeEntryRequest));
        }
        console.log('before forkjoin');
        return forkJoin(calls).pipe(
          map(results => {
            let result = false;
            results.forEach(r => (result = result && r.ok));
            return result;
          })
        );
      })
    );
    return null;
  }
}
