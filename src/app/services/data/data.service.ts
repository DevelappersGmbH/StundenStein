import { ColorService } from '../color/color.service';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { flatMap, map, share } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { HourGlassMapper } from 'src/app/model/mappers/hourglass-mapper';
import { HourGlassService } from '../hourglass/hourglass.service';
import { HourGlassTimeLog } from 'src/app/redmine-model/hourglass-time-log.interface';
import { HourGlassTimeLogBookRequest } from 'src/app/redmine-model/requests/hourglass-time-log-book-request.interface';
import { HourGlassTimeLogRequest } from 'src/app/redmine-model/requests/hourglass-time-log-request.interface';
import { HourGlassTimeLogsBulkRequest } from 'src/app/redmine-model/requests/hourglass-time-logs-bulk-request.interface';
import { HourGlassTimeTrackers } from 'src/app/redmine-model/hourglass-time-trackers.interface';
import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Issue } from 'src/app/model/issue.interface';
import { Project } from 'src/app/model/project.interface';
import { RedmineMapper } from 'src/app/model/mappers/redmine-mapper';
import { RedmineService } from '../redmine/redmine.service';
import { RedmineTimeEntryActivities } from 'src/app/redmine-model/redmine-time-entry-activities.interface';
import { RedmineTimeEntryRequest } from 'src/app/redmine-model/requests/redmine-time-entry-request.interface';
import { TimeLog } from 'src/app/model/time-log.interface';
import { TimeTracker } from 'src/app/model/time-tracker.interface';
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
    private redmineMapper: RedmineMapper,
    private hourglassMapper: HourGlassMapper,
    private hourglassService: HourGlassService,
    private userService: UserService,
    private colorService: ColorService,
    private datePipe: DatePipe
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
    } else if (this.projectsObservable) {
      return this.projectsObservable;
    } else {
      this.projectsObservable = this.redmineService.getProjects().pipe(
        map(data => {
          this.projects = this.redmineMapper.mapRedmineProjectArrayToProjectArray(
            data
          );
          this.projectsRecentlyCached = new Date();
          this.projectsObservable = null;
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
    if (this.issues && this.issues.length > 0 && !expired) {
      return of(this.issues);
    } else if (this.issuesObservable) {
      return this.issuesObservable;
    } else {
      const calls: Observable<any>[] = [
        this.redmineService.getIssues(),
        this.getProjects()
      ];
      this.issuesObservable = forkJoin(calls).pipe(
        map(results => {
          this.issues = this.redmineMapper.mapRedmineIssueArrayToIssueArray(
            results[0],
            results[1]
          );
          this.issuesRecentlyCached = new Date();
          this.issuesObservable = null;
          return this.issues;
        }),
        share()
      );
      return this.issuesObservable;
    }
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
            this.hourglassMapper.mapPartialTimeTrackerToPartialHourGlassTimeTracker(
              timeTracker,
              results[0]
            )
          )
          .pipe(
            map(t =>
              this.hourglassMapper.mapHourGlassTimeTrackerToTimeTracker(
                t,
                {
                  time_entry_activities: []
                },
                this.issues,
                this.projects
              )
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
            this.hourglassMapper.mapTimeTrackerToHourGlassTimeTracker(
              timeTracker,
              results[0]
            )
          )
          .pipe(
            flatMap(r => {
              return this.getTimeTrackerByUserId(this.userService.getUser().id);
            })
          );
      })
    );
  }

  stopTimeTracker(timeTracker: TimeTracker): Observable<TimeLog> {
    const calls: Observable<any>[] = [
      this.hourglassService.stopTimeTracker(timeTracker.id),
      this.redmineService.getTimeEntryActivities()
    ];
    return forkJoin(calls).pipe(
      map(results => {
        const hgTimeTrackerStopResponse = results[0];
        const redmineTimeEntryActivities = results[1];

        if (hgTimeTrackerStopResponse.time_booking) {
          return {
            id: hgTimeTrackerStopResponse.time_booking.time_log_id,
            hourGlassTimeBookingId: hgTimeTrackerStopResponse.time_booking.id,
            billable: this.redmineMapper.mapRedmineTimeEntryActivityToBillable(
              hgTimeTrackerStopResponse.time_booking.time_entry.activity_id,
              redmineTimeEntryActivities
            ),
            booked: true,
            comment: hgTimeTrackerStopResponse.time_booking.time_entry.comments,
            timeStarted: new Date(hgTimeTrackerStopResponse.time_booking.start),
            timeStopped: new Date(hgTimeTrackerStopResponse.time_booking.stop),
            timeInHours:
              hgTimeTrackerStopResponse.time_booking.time_entry.hours,
            project: this.projects.find(
              entry =>
                entry.id ===
                hgTimeTrackerStopResponse.time_booking.time_entry.project_id
            ),
            issue: this.issues.find(
              entry =>
                entry.id ===
                hgTimeTrackerStopResponse.time_booking.time_entry.issue_id
            ),
            user: this.redmineMapper.mapRedmineUserIdToCurrentUserOrNull(
              hgTimeTrackerStopResponse.time_booking.time_entry.user_id
            ),
            redmineTimeEntryId:
              hgTimeTrackerStopResponse.time_booking.time_entry_id
          };
        } else if (hgTimeTrackerStopResponse.time_log) {
          return {
            id: hgTimeTrackerStopResponse.time_log.id,
            billable: true,
            booked: false,
            comment: hgTimeTrackerStopResponse.time_log.comments,
            hourGlassTimeBookingId: null,
            issue: null,
            project: null,
            timeStarted: new Date(hgTimeTrackerStopResponse.time_log.start),
            timeStopped: new Date(hgTimeTrackerStopResponse.time_log.stop),
            timeInHours: hgTimeTrackerStopResponse.time_log.hours,
            user: this.redmineMapper.mapRedmineUserIdToCurrentUserOrNull(
              hgTimeTrackerStopResponse.time_log.user_id
            ),
            redmineTimeEntryId: null
          };
        }
        return null;
      })
    );
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
        return this.hourglassMapper.mapHourGlassTimeTrackersToFirstTimeTracker(
          hourGlassTimeTrackers,
          redmineTimeEntryActivities,
          this.issues,
          this.projects
        );
      })
    );
  }

  getTimeLogCount(userId: number = -1): Observable<number> {
    return this.hourglassService.getTimeLogCount(userId);
  }

  getTimeLogs(offset: number, limit: number, userId: number = -1) {
    const calls: Observable<any>[] = [
      this.hourglassService.getTimeLogs(offset, limit, userId),
      this.hourglassService.getTimeBookings(offset, limit, userId),
      this.redmineService.getTimeEntryActivities(),
      this.getProjects(),
      this.getIssues()
    ];
    return forkJoin(calls).pipe(
      map(results =>
        this.hourglassMapper.mapHourGlassTimeLogsAndBookingsToTimeLogs(results)
      )
    );
  }

  getAllTimeLogs(userId: number = -1): Observable<TimeLog[]> {
    const calls: Observable<any>[] = [
      this.hourglassService.getAllTimeLogs(userId),
      this.hourglassService.getAllTimeBookings(userId),
      this.redmineService.getTimeEntryActivities(),
      this.getProjects(),
      this.getIssues()
    ];
    return forkJoin(calls).pipe(
      map(results =>
        this.hourglassMapper.mapHourGlassTimeLogsAndBookingsToTimeLogs(results)
      )
    );
  }

  createTimeLog(timelog: TimeLog): Observable<TimeLog> {
    const calls: Observable<any>[] = [
      this.redmineService.getTimeEntryActivities(), // To map Billable
      this.getProjects(), // To map created TimeBooking back to TimeLog
      this.getIssues() // To map created TimeBooking back to TimeLog
    ];
    return forkJoin(calls).pipe(
      flatMap(results => {
        const redmineTimeEntryActivities: RedmineTimeEntryActivities =
          results[0];
        const projects: Project[] = results[1];
        const issues: Issue[] = results[2];
        const hgLog: Partial<HourGlassTimeLog> = {
          comments: timelog.comment,
          start: timelog.timeStarted.toISOString(),
          stop: timelog.timeStopped.toISOString(),
          hours: timelog.timeInHours,
          user_id: this.userService.getUser().id
        };
        const hgCreateTimeLogRequest: HourGlassTimeLogsBulkRequest = {
          time_logs: [hgLog]
        };
        return this.hourglassService.createTimeLog(hgCreateTimeLogRequest).pipe(
          flatMap(data => {
            let createdTimeLog: HourGlassTimeLog;
            if (data.ok && data.body.success.length > 0) {
              // If the timelog was created successfully, set createdTimeLog
              createdTimeLog = data.body.success[0];
              if (timelog.project !== undefined && timelog.project !== null) {
                // A timelog is booked if it has got a project attached.
                // Book created time log
                const bookRequest: HourGlassTimeLogBookRequest = {
                  time_booking: {
                    start: createdTimeLog.start,
                    stop: createdTimeLog.stop,
                    activity_id: this.redmineMapper.mapBillableToRedmineTimeEntryActivityId(
                      timelog.billable,
                      redmineTimeEntryActivities
                    ),
                    comments: createdTimeLog.comments,
                    issue_id:
                      timelog.issue && timelog.issue.id
                        ? timelog.issue.id
                        : null,
                    project_id:
                      timelog.project && timelog.project.id
                        ? timelog.project.id
                        : null,
                    user_id: timelog.user.id
                  }
                };
                return this.hourglassService
                  .bookTimeLog(createdTimeLog.id, bookRequest)
                  .pipe(
                    map(response =>
                      this.hourglassMapper.mapHourGlassTimeBookingToTimeLog(
                        response.body,
                        projects,
                        issues,
                        redmineTimeEntryActivities
                      )
                    )
                  );
              }
            }
            return of(
              this.hourglassMapper.mapHourGlassTimeLogToTimeLog(createdTimeLog)
            );
          })
        );
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

  updateTimeLog(timelog: TimeLog): Observable<boolean> {
    return this.redmineService.getTimeEntryActivities().pipe(
      flatMap(timeEntryActivities => {
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
              spent_on: this.datePipe.transform(
                timelog.timeStarted,
                'yyyy-MM-dd',
                'utc'
              ),
              activity_id: this.redmineMapper.mapBillableToRedmineTimeEntryActivityId(
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

        return forkJoin(calls).pipe(
          flatMap(results => {
            let result = true;
            results.forEach(r => {
              result = result && r.ok;
            });
            if (
              result &&
              (timelog.redmineTimeEntryId === undefined ||
                timelog.redmineTimeEntryId === null) &&
              timelog.project !== undefined &&
              timelog.project !== null
            ) {
              // A timelog is booked if it has got a project attached.
              // Book created time log
              const bookRequest: HourGlassTimeLogBookRequest = {
                time_booking: {
                  start: timelog.timeStarted.toISOString(),
                  stop: timelog.timeStopped.toISOString(),
                  activity_id: this.redmineMapper.mapBillableToRedmineTimeEntryActivityId(
                    timelog.billable,
                    timeEntryActivities
                  ),
                  comments: timelog.comment,
                  issue_id:
                    timelog.issue && timelog.issue.id ? timelog.issue.id : null,
                  project_id:
                    timelog.project && timelog.project.id
                      ? timelog.project.id
                      : null,
                  user_id: timelog.user.id
                }
              };

              return this.hourglassService
                .bookTimeLog(timelog.id, bookRequest)
                .pipe(map(response => result && response.ok));
            }
            return of(result);
          })
        );
      })
    );
  }
}
