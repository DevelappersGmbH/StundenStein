import { Injectable } from '@angular/core';
import { BaseDataService } from '../basedata/basedata.service';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class HourGlassService extends BaseDataService {

  private timeTrackersUrl = '/hourglass/time_trackers';

  constructor(protected authenticationService: AuthenticationService,
    private httpClient: HttpClient) {
    super(authenticationService);
  }


}
