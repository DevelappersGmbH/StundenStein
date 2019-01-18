import { HourGlassTimeBooking } from 'src/app/redmine-model/hourglass-time-booking.interface';
import { HourGlassTimeLog } from 'src/app/redmine-model/hourglass-time-log.interface';
import { HourGlassTimeTracker } from 'src/app/redmine-model/hourglass-time-tracker.interface';
import { HourGlassTimeTrackers } from 'src/app/redmine-model/hourglass-time-trackers.interface';
import { Injectable } from '@angular/core';
import { Issue } from '../issue.interface';
import { Project } from '../project.interface';
import { RedmineMapper } from './redmine-mapper';
import { RedmineTimeEntryActivities } from 'src/app/redmine-model/redmine-time-entry-activities.interface';
import { TimeLog } from '../time-log.interface';
import { TimeTracker } from '../time-tracker.interface';
import { UserService } from 'src/app/services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class HourGlassMapper {
  constructor(
    private redmineMapper: RedmineMapper,
    private userService: UserService
  ) {}

  mapHourGlassTimeTrackersToFirstTimeTracker(
    hourglassTimeTrackers: HourGlassTimeTrackers,
    redmineTimeEntryActivities: RedmineTimeEntryActivities,
    issues: Issue[],
    projects: Project[]
  ): TimeTracker {
    if (hourglassTimeTrackers.records.length === 0) {
      return null;
    }
    return this.mapHourGlassTimeTrackerToTimeTracker(
      hourglassTimeTrackers.records[0],
      redmineTimeEntryActivities,
      issues,
      projects
    );
  }

  mapHourGlassTimeTrackerToTimeTracker(
    hourglassTimeTracker: HourGlassTimeTracker,
    redmineTimeEntryActivities: RedmineTimeEntryActivities,
    issues: Issue[],
    projects: Project[]
  ): TimeTracker {
    const timeTracker: TimeTracker = {
      id: hourglassTimeTracker.id,
      timeStarted: new Date(hourglassTimeTracker.start),
      billable: true
    };
    if (hourglassTimeTracker.issue_id) {
      timeTracker.issue = issues.find(
        i => i.id === hourglassTimeTracker.issue_id
      );
    }
    if (hourglassTimeTracker.project_id) {
      timeTracker.project = projects.find(
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
      timeTracker.billable = this.redmineMapper.mapRedmineTimeEntryActivityToBillable(
        hourglassTimeTracker.activity_id,
        redmineTimeEntryActivities
      );
    }
    return timeTracker;
  }

  mapHourGlassTimeLogsAndBookingsToTimeLogs(results: any[]) {
    const timelogs: TimeLog[] = [];
    const hourglassTimeLogs: HourGlassTimeLog[] = results[0];
    const hourglassTimeBookings: HourGlassTimeBooking[] = results[1];
    const redmineTimeEntryActivities: RedmineTimeEntryActivities = results[2];
    const projects: Project[] = results[3];
    const issues: Issue[] = results[4];
    hourglassTimeBookings.forEach(hgbooking => {
      timelogs.push(
        this.mapHourGlassTimeBookingToTimeLog(
          hgbooking,
          projects,
          issues,
          redmineTimeEntryActivities
        )
      );
    });
    hourglassTimeLogs.forEach(hglog => {
      if (timelogs.findIndex(entry => entry.id === hglog.id) === -1) {
        timelogs.push(this.mapHourGlassTimeLogToTimeLog(hglog));
      }
    });
    return timelogs.sort((a, b) => {
      return <any>new Date(b.timeStarted) - <any>new Date(a.timeStarted);
    });
  }

  mapHourGlassTimeBookingToTimeLog(
    hgbooking: HourGlassTimeBooking,
    projects: Project[],
    issues: Issue[],
    redmineTimeEntryActivities: RedmineTimeEntryActivities
  ): TimeLog {
    return {
      id: hgbooking.time_log_id,
      hourGlassTimeBookingId: hgbooking.id,
      billable: this.redmineMapper.mapRedmineTimeEntryActivityToBillable(
        hgbooking.time_entry.activity_id,
        redmineTimeEntryActivities
      ),
      booked: true,
      comment: hgbooking.time_entry.comments,
      timeStarted: new Date(hgbooking.start),
      timeStopped: new Date(hgbooking.stop),
      timeInHours: hgbooking.time_entry.hours,
      project: projects.find(
        entry => entry.id === hgbooking.time_entry.project_id
      ),
      issue: issues.find(entry => entry.id === hgbooking.time_entry.issue_id),
      user: this.redmineMapper.mapRedmineUserIdToCurrentUserOrNull(
        hgbooking.time_entry.user_id
      ),
      redmineTimeEntryId: hgbooking.time_entry_id
    };
  }

  mapHourGlassTimeLogToTimeLog(hglog: HourGlassTimeLog): TimeLog {
    return {
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
      user: this.redmineMapper.mapRedmineUserIdToCurrentUserOrNull(
        hglog.user_id
      ),
      redmineTimeEntryId: null
    };
  }

  mapTimeTrackerToHourGlassTimeTracker(
    timeTracker: TimeTracker,
    redmineTimeEntryActivities: RedmineTimeEntryActivities
  ): HourGlassTimeTracker {
    const hgtracker: HourGlassTimeTracker = {
      id: timeTracker.id,
      user_id: this.userService.getUser().id,
      start: timeTracker.timeStarted.toISOString(),
      activity_id: this.redmineMapper.mapBillableToRedmineTimeEntryActivityId(
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
      activity_id: this.redmineMapper.mapBillableToRedmineTimeEntryActivityId(
        timeTracker.billable,
        redmineTimeEntryActivities
      )
    };
    return hgtracker;
  }
}
