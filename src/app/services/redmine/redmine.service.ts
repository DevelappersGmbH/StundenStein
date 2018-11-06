import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';
import { HttpClient } from '@angular/common/http';
import { Projects } from 'src/app/redmine-model/projects.interface';
import { BaseDataService } from '../basedata/basedata.service';

@Injectable({
  providedIn: 'root'
})
export class RedmineService extends BaseDataService {

  private projectsUrl = '/projects';

  constructor(protected authenticationService: AuthenticationService,
    private httpClient: HttpClient) {
    super(authenticationService);
  }

  getProjects(): Observable<Projects> {
    const endpoint = this.getJsonEndpointUrl(this.projectsUrl);
    console.log(endpoint);
    return this.httpClient.get<Projects>(endpoint);
  }
}
