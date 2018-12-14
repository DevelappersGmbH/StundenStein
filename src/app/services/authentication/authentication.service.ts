import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { RedmineUserObject } from 'src/app/redmine-model/redmine-user.interface';
import { User } from 'src/app/model/user.interface';

const currentUserAuthTokenKey = 'currentUserAuthToken';
const redmineApiUrlKey = 'redmineApiUrl';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private usersUrl = '/users/current.json';

  redirectUrl: string;

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  private generateExpirationDate(rememberMe: boolean = false): Date {
    const currentDate = new Date();
    let newExpirationDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      currentDate.getHours() + 4,
      currentDate.getMinutes()
    );
    if (rememberMe) {
      newExpirationDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 7,
        currentDate.getHours(),
        currentDate.getMinutes()
      );
    }
    return newExpirationDate;
  }

  private setRedmineApiUrl(redmineUrl: string, expirationDate: Date) {
    this.cookieService.set(
      redmineApiUrlKey,
      this.prepareRedmineUrl(redmineUrl),
      expirationDate
    );
  }

  getRedmineApiUrl(): string {
    if (this.checkIfRedmineUrlExist()) {
      return this.cookieService.get(redmineApiUrlKey);
    }
    return null;
  }

  private prepareRedmineUrl(url: string): string {
    const lastChar = url.slice(-1);
    if (lastChar === '/') {
      return url.slice(0, url.length - 1);
    }
    return url;
  }

  checkIfRedmineUrlExist(): boolean {
    return this.cookieService.check(redmineApiUrlKey);
  }

  private setAuthToken(token: string, expirationDate: Date) {
    this.cookieService.set(currentUserAuthTokenKey, token, expirationDate);
  }

  getAuthToken(): string {
    if (this.checkIfAuthTokenExist()) {
      return this.cookieService.get(currentUserAuthTokenKey);
    }
    return null;
  }

  checkIfAuthTokenExist(): boolean {
    return this.cookieService.check(currentUserAuthTokenKey);
  }

  login(
    redmineUrl: string,
    apiKey: string,
    rememberMe: boolean = false
  ): Observable<User> {
    const expirationDate = this.generateExpirationDate(rememberMe);
    this.setRedmineApiUrl(redmineUrl, expirationDate);
    this.setAuthToken(apiKey, expirationDate);

    const url =
      environment.corsProxyUrl + this.getRedmineApiUrl() + this.usersUrl;

    return this.http.get<RedmineUserObject>(url).pipe(
      map((res: RedmineUserObject) => {
        return {
          id: res.user.id,
          name: `${res.user.firstname} ${res.user.lastname}`
        };
      })
    );
  }

  logout() {
    this.clearCookies();
  }

  private clearCookies() {
    this.cookieService.delete(currentUserAuthTokenKey);
    this.cookieService.delete(redmineApiUrlKey);
  }
}
