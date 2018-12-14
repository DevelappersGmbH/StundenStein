import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot
  } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const url: string = state.url;
    return this.checkLogin(url);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.canActivate(route, state);
  }

  checkLogin(url: string): boolean {
    if (
      this.authenticationService.checkIfRedmineUrlExist() &&
      this.authenticationService.checkIfAuthTokenExist()
    ) {
      return true;
    }

    this.authenticationService.redirectUrl = url;

    this.router.navigate(['/login']);
    return false;
  }
}
