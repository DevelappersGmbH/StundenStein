import { AuthenticationService } from '../authentication/authentication.service';
import { BaseDataService } from '../basedata/basedata.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RedmineIssues } from 'src/app/redmine-model/redmine-issues.interface';
import { RedmineProject } from 'src/app/redmine-model/redmine-project.interface';
import { RedmineProjects } from 'src/app/redmine-model/redmine-projects.interface';
import { RedmineTimeEntryActivities } from 'src/app/redmine-model/redmine-time-entry-activities.interface';
import { RedmineTimeEntryRequest } from 'src/app/redmine-model/requests/redmine-time-entry-request.interface';

@Injectable({
  providedIn: 'root'
})
export class RedmineService extends BaseDataService {
  private projectsUrl = '/projects';
  private issuesUrl = '/issues';
  private timeEntriesUrl = '/time_entries';
  private activituesUrl = '/enumerations/time_entry_activities';

  constructor(
    protected authenticationService: AuthenticationService,
    protected httpClient: HttpClient
  ) {
    super(authenticationService, httpClient);
  }

  getProjects(): Observable<RedmineProjects> {
    const endpoint = this.getJsonEndpointUrl(this.projectsUrl) + '?limit=100';
    return this.httpClient.get<RedmineProjects>(endpoint);
  }

  getIssues(): Observable<RedmineIssues> {
    const endpoint = this.getJsonEndpointUrl(this.issuesUrl) + '?limit=100';
    return this.httpClient.get<RedmineIssues>(endpoint);
  }

  getTimeEntryActivities(): Observable<RedmineTimeEntryActivities> {
    const query = this.getJsonEndpointUrl(this.activituesUrl);
    return this.httpClient.get<RedmineTimeEntryActivities>(query);
  }

  updateTimeEntry(
    timeEntryRequest: RedmineTimeEntryRequest
  ): Observable<HttpResponse<any>> {
    const query = this.getJsonEndpointUrl(
      this.timeEntriesUrl + '/' + timeEntryRequest.time_entry.id
    );
    return this.httpClient.put<HttpResponse<any>>(query, {
      observe: 'response'
    });
  }
}
