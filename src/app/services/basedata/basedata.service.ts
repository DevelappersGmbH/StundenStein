import { AuthenticationService } from '../authentication/authentication.service';
import { environment } from 'src/environments/environment';
import { forkJoin, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseDataService {
  constructor(
    protected authenticationService: AuthenticationService,
    protected httpClient: HttpClient
  ) {}

  protected getJsonEndpointUrl(endpoint: string): string {
    return (
      environment.corsProxyUrl +
      this.authenticationService.getRedmineApiUrl() +
      endpoint +
      '.json'
    );
  }

  downloadMoreItems<T>(
    query: string,
    itemsToDownload: number,
    limit: number
  ): Observable<T[]> {
    const downloadsToDo = itemsToDownload / limit;
    const calls: Observable<T>[] = [];
    // i starts by 1 because page is already downloaded.
    for (let i = 1; i < downloadsToDo + 1; i++) {
      const innerquery = query + '&offset=' + limit * i;
      calls.push(this.httpClient.get<T>(innerquery));
    }
    return forkJoin(calls);
  }
}
