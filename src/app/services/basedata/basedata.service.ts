import { Injectable } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseDataService {

  constructor(protected authenticationService: AuthenticationService) { }

  protected getJsonEndpointUrl(endpoint: string): string {
    return environment.corsProxyUrl + this.authenticationService.getRedmineApiUrl() + endpoint + '.json';
  }
}
