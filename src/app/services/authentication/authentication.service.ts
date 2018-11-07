import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { RedmineUserObject } from 'src/app/redmine-model/redmine-user.interface';
import { User } from 'src/app/model/user.interface';

const currentUserAuthTokenKey = 'currentUserAuthToken';
const redmineApiUrlKey = 'redmineApiUrl';
const expirationDateKey = 'expirationDate';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private usersUrl = '/users/current.json';

  redirectUrl: string;

  constructor(private http: HttpClient) {}

  private setExpirationDate(rememberMe: boolean = false) {
    const currentDate = new Date();
    let newExpirationDate = currentDate.setHours(currentDate.getHours() + 4);
    if (rememberMe) {
      newExpirationDate = currentDate.setDate(currentDate.getDate() + 7);
    }
    const expirationDate = localStorage.getItem(expirationDateKey);
    if (expirationDate) {
      localStorage.removeItem(expirationDateKey);
    }
    localStorage.setItem(expirationDateKey, JSON.stringify(newExpirationDate));
  }

  private getExpirationDate(): number {
    const expirationDate = localStorage.getItem(expirationDateKey);
    if (expirationDate) {
      return JSON.parse(expirationDate);
    }
    return null;
  }

  isExpirationDateValid(): boolean {
    const currentDate = Date.now();
    const expirationDate = this.getExpirationDate();
    if (currentDate >= expirationDate) {
      this.clearLocalStorage();
      return false;
    }
    return true;
  }

  private setRedmineApiUrl(redmineUrl: string) {
    const redmineApiUrl = localStorage.getItem(redmineApiUrlKey);
    if (redmineApiUrl) {
      localStorage.removeItem(redmineApiUrlKey);
    }
    localStorage.setItem(redmineApiUrlKey, this.prepareRedmineUrl(redmineUrl));
  }

  getRedmineApiUrl(): string {
    const redmineUrl = localStorage.getItem(redmineApiUrlKey);
    if (redmineUrl) {
      return redmineUrl;
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
    return !!this.getRedmineApiUrl();
  }

  private setAuthToken(token: string) {
    const tokenString = localStorage.getItem(currentUserAuthTokenKey);
    if (tokenString) {
      localStorage.removeItem(currentUserAuthTokenKey);
    }
    localStorage.setItem(currentUserAuthTokenKey, token);
  }

  getAuthToken(): string {
    const tokenString = localStorage.getItem(currentUserAuthTokenKey);
    if (tokenString) {
      return tokenString;
    }
    return null;
  }

  login(
    redmineUrl: string,
    apiKey: string,
    rememberMe: boolean = false
  ): Observable<User> {
    this.setRedmineApiUrl(redmineUrl);
    this.setAuthToken(apiKey);
    const url =
      environment.corsProxyUrl + this.getRedmineApiUrl() + this.usersUrl;

    return this.http.get<RedmineUserObject>(url).pipe(
      map((res: RedmineUserObject) => {
        this.setExpirationDate(rememberMe);
        return {
          id: res.user.id,
          name: `${res.user.firstname} ${res.user.lastname}`
        };
      })
    );
  }

  logout() {
    this.clearLocalStorage();
  }

  private clearLocalStorage() {
    localStorage.clear();
  }
}
