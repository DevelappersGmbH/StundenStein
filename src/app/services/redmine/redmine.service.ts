import { AuthenticationService } from '../authentication/authentication.service';
import { BaseDataService } from '../basedata/basedata.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { RedmineIssue } from 'src/app/redmine-model/redmine-issue.interface';
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

  getProjects(): Observable<RedmineProject[]> {
    const query = this.getJsonEndpointUrl(this.projectsUrl) + '?limit=100';
    return this.httpClient.get<RedmineProjects>(query).pipe(
      mergeMap(projects => {
        const items: RedmineProject[] = projects.projects;
        const itemsToDownload = projects.total_count - items.length;
        if (itemsToDownload > 0) {
          return this.downloadMoreItems<RedmineProjects>(
            query,
            itemsToDownload,
            projects.limit
          ).pipe(
            map(results => {
              results.forEach(r => {
                r.projects.forEach(project => {
                  if (
                    items.findIndex(entry => entry.id === project.id) === -1
                  ) {
                    items.push(project);
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

  getIssues(): Observable<RedmineIssue[]> {
    const query = this.getJsonEndpointUrl(this.issuesUrl) + '?limit=100';
    return this.httpClient.get<RedmineIssues>(query).pipe(
      mergeMap(issues => {
        const items: RedmineIssue[] = issues.issues;
        const itemsToDownload = issues.total_count - items.length;
        if (itemsToDownload > 0) {
          return this.downloadMoreItems<RedmineIssues>(
            query,
            itemsToDownload,
            issues.limit
          ).pipe(
            map(results => {
              results.forEach(r => {
                r.issues.forEach(issue => {
                  if (items.findIndex(entry => entry.id === issue.id) === -1) {
                    items.push(issue);
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
    return this.httpClient.put<HttpResponse<any>>(query, timeEntryRequest, {
      observe: 'response'
    });
  }
}
