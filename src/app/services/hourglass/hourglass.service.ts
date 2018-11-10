import { AuthenticationService } from '../authentication/authentication.service';
import { BaseDataService } from '../basedata/basedata.service';
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
}
