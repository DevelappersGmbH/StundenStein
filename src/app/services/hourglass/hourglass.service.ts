import { AuthenticationService } from '../authentication/authentication.service';
import { BaseDataService } from '../basedata/basedata.service';
import { flatMap, map } from 'rxjs/operators';
import { HourGlassTimeBooking } from 'src/app/redmine-model/hourglass-time-booking.interface';
import { HourGlassTimeBookings } from 'src/app/redmine-model/hourglass-time-bookings.interface';
import { HourGlassTimeLog } from 'src/app/redmine-model/hourglass-time-log.interface';
import { HourGlassTimeLogRequest } from 'src/app/redmine-model/requests/hourglass-time-log-request.interface';
import { HourGlassTimeLogs } from 'src/app/redmine-model/hourglass-time-logs.interface';
import { HourGlassTimeTracker } from 'src/app/redmine-model/hourglass-time-tracker.interface';
import { HourGlassTimeTrackerRequest } from 'src/app/redmine-model/requests/hourglass-time-tracker-request.interface';
import { HourGlassTimeTrackers } from 'src/app/redmine-model/hourglass-time-trackers.interface';
import { HourGlassTimeTrackerStopResponse } from 'src/app/redmine-model/responses/hourglass-time-tracker-stop-response.interface';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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
    protected httpClient: HttpClient
  ) {
    super(authenticationService, httpClient);
  }

  startTimeTracker(
    timeTracker: Partial<HourGlassTimeTracker>
  ): Observable<HourGlassTimeTracker> {
    const endpoint = this.getJsonEndpointUrl(this.startTimeTrackerUrl);
    const request: HourGlassTimeTrackerRequest = { time_tracker: timeTracker };
    return this.httpClient.post<HourGlassTimeTracker>(endpoint, request);
  }

  updateTimeTracker(
    timeTracker: HourGlassTimeTracker
  ): Observable<HourGlassTimeTracker> {
    const query = this.getJsonEndpointUrl(
      this.timeTrackersUrl + '/' + timeTracker.id
    );
    const request: HourGlassTimeTrackerRequest = { time_tracker: timeTracker };
    return this.httpClient.put<HourGlassTimeTracker>(query, request);
  }

  stopTimeTracker(
    timeTrackerId: number
  ): Observable<HourGlassTimeTrackerStopResponse> {
    const query = this.getJsonEndpointUrl(
      this.timeTrackersUrl + '/' + timeTrackerId + '/stop'
    );
    return this.httpClient.delete<HourGlassTimeTrackerStopResponse>(query);
  }

  getTimeTrackersByUserId(userId: number): Observable<HourGlassTimeTrackers> {
    const query =
      this.getJsonEndpointUrl(this.timeTrackersUrl) + '?user_id=' + userId;
    return this.httpClient.get<HourGlassTimeTrackers>(query);
  }

  getTimeLogs(userId: number = -1): Observable<HourGlassTimeLog[]> {
    let query =
      this.getJsonEndpointUrl(this.timeLogsUrl) +
      '?limit=' +
      this.timeLogsDownloadLimit;
    if (userId > -1) {
      query += '&user_id=' + userId;
    }
    return this.httpClient.get<HourGlassTimeLogs>(query).pipe(
      flatMap(timeLogs => {
        const items: HourGlassTimeLog[] = timeLogs.records;
        const itemsToDownload = timeLogs.count - items.length;
        if (itemsToDownload > 0) {
          return this.downloadMoreItems<HourGlassTimeLogs>(
            query,
            itemsToDownload,
            timeLogs.limit
          ).pipe(
            map(results => {
              results.forEach(r => {
                r.records.forEach(timelog => {
                  if (
                    items.findIndex(entry => entry.id === timelog.id) === -1
                  ) {
                    items.push(timelog);
                  }
                });
              });
              return items;
            })
          );
        }
        return of(items);
      })
    );
  }

  getTimeBookings(userId: number = -1): Observable<HourGlassTimeBooking[]> {
    let query =
      this.getJsonEndpointUrl(this.timeBookingsUrl) +
      '?limit=' +
      this.timeBookingsDownloadLimit;
    if (userId > -1) {
      query += '&user_id=' + userId;
    }
    return this.httpClient.get<HourGlassTimeBookings>(query).pipe(
      flatMap(timeLogs => {
        const items: HourGlassTimeBooking[] = timeLogs.records;
        const itemsToDownload = timeLogs.count - items.length;
        if (itemsToDownload > 0) {
          return this.downloadMoreItems<HourGlassTimeBookings>(
            query,
            itemsToDownload,
            timeLogs.limit
          ).pipe(
            map(results => {
              results.forEach(r => {
                r.records.forEach(timebooking => {
                  if (
                    items.findIndex(entry => entry.id === timebooking.id) === -1
                  ) {
                    items.push(timebooking);
                  }
                });
              });
              return items;
            })
          );
        }
        return of(items);
      })
    );
  }

  deleteTimeLog(timeLogId: number): Observable<HttpResponse<any>> {
    const query = this.getJsonEndpointUrl(this.timeLogsUrl + '/' + timeLogId);
    return this.httpClient.delete<HttpResponse<any>>(query, {
      observe: 'response'
    });
  }

  deleteTimeBooking(timeLogId: number): Observable<HttpResponse<any>> {
    const query = this.getJsonEndpointUrl(
      this.timeBookingsUrl + '/' + timeLogId
    );
    return this.httpClient.delete<HttpResponse<any>>(query, {
      observe: 'response'
    });
  }

  updateTimeLog(
    timeLogRequest: HourGlassTimeLogRequest
  ): Observable<HttpResponse<any>> {
    const query = this.getJsonEndpointUrl(
      this.timeLogsUrl + '/' + timeLogRequest.time_log.id
    );
    return this.httpClient.put<HttpResponse<any>>(query, timeLogRequest, {
      observe: 'response'
    });
  }
}
