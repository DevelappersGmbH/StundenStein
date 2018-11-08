import { AuthenticationService } from '../authentication/authentication.service';
import { BaseDataService } from '../basedata/basedata.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RedmineProjects } from 'src/app/redmine-model/redmine-projects.interface';
import { RedmineIssue } from 'src/app/redmine-model/redmine-issue.interface';
import { RedmineIssuesRequest } from 'src/app/redmine-model/requests/redmine-issues-request.interface';

@Injectable({
  providedIn: 'root'
})
export class RedmineService extends BaseDataService {
  private projectsUrl = '/projects';
  private issuesUrl = '/issues';

  constructor(
    protected authenticationService: AuthenticationService,
    private httpClient: HttpClient
  ) {
    super(authenticationService);
  }

  getProjects(): Observable<RedmineProjects> {
    const endpoint = this.getJsonEndpointUrl(this.projectsUrl);
    console.log(endpoint);
    return this.httpClient.get<RedmineProjects>(endpoint);
  }

  getIssues(): Observable<RedmineIssuesRequest> {
    const endpoint = this.getJsonEndpointUrl(this.issuesUrl);
    console.log(endpoint);
    return this.httpClient.get<RedmineIssuesRequest>(endpoint);
  }
}
