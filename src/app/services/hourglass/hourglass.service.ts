import { AuthenticationService } from '../authentication/authentication.service';
import { BaseDataService } from '../basedata/basedata.service';
import { HourGlassTimeBookings } from 'src/app/redmine-model/hourglass-time-bookings.interface';
import { HourGlassTimeLogs } from 'src/app/redmine-model/hourglass-time-logs.interface';
import { HourGlassTimeTracker } from 'src/app/redmine-model/hourglass-time-tracker.interface';
import { HourGlassTimeTrackers } from 'src/app/redmine-model/hourglass-time-trackers.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TimeTracker } from 'src/app/model/time-tracker.interface';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class HourGlassService extends BaseDataService {
  private timeTrackersUrl = '/hourglass/time_trackers';
  private startTimeTrackerUrl = '/hourglass/time_trackers/start';
  private timeLogsUrl = '/hourglass/time_logs';
  private timeLogsDownloadLimit = 100;
  private timeBookingsUrl = '/hourglass/time_bookings';
  private timeBookingsDownloadLimit = 100;

  constructor(
    protected authenticationService: AuthenticationService,
    private httpClient: HttpClient
  ) {
    super(authenticationService);
  }

  startTimeTracker(
    issueId: number = null,
    comment: string = null
  ): Observable<HourGlassTimeTracker> {
    const endpoint = this.getJsonEndpointUrl(this.startTimeTrackerUrl);
    const tracker: Partial<HourGlassTimeTracker> = {};
    if (issueId) {
      tracker.issue_id = issueId;
    }
    if (comment) {
      tracker.comments = comment;
    }
    return this.httpClient.post<HourGlassTimeTracker>(endpoint, tracker);
  }

  getTimeTrackersByUserId(userId: number): Observable<HourGlassTimeTrackers> {
    const query =
      this.getJsonEndpointUrl(this.timeTrackersUrl) + '?user_id=' + userId;
    return this.httpClient.get<HourGlassTimeTrackers>(query);
  }

  getTimeLogs(userId: number = -1): Observable<HourGlassTimeLogs> {
    let query =
      this.getJsonEndpointUrl(this.timeLogsUrl) +
      '?limit=' +
      this.timeLogsDownloadLimit;
    if (userId > -1) {
      query += '&user_id=' + userId;
    }
    return this.httpClient.get<HourGlassTimeLogs>(query);
  }

  getTimeBookings(userId: number = -1): Observable<HourGlassTimeBookings> {
    let query =
      this.getJsonEndpointUrl(this.timeBookingsUrl) +
      '?limit=' +
      this.timeLogsDownloadLimit;
    if (userId > -1) {
      query += '&user_id=' + userId;
    }
    return this.httpClient.get<HourGlassTimeBookings>(query);
  }
}
