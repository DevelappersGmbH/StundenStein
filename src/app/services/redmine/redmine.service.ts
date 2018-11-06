import { AuthenticationService } from '../authentication/authentication.service';
import { BaseDataService } from '../basedata/basedata.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RedmineProjects } from 'src/app/redmine-model/redmine-projects.interface';

@Injectable({
  providedIn: 'root'
})
export class RedmineService extends BaseDataService {
  private projectsUrl = '/projects';

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
}
