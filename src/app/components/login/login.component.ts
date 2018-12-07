import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  redmineUrl: string;
  apiKey: string;
  rememberMe: boolean;

  isLoggedIn: boolean;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private userService: UserService
  ) {
    this.isLoggedIn =
      this.authenticationService.checkIfRedmineUrlExist() &&
      this.authenticationService.checkIfAuthTokenExist();
  }

  ngOnInit() {}

  login() {
    if (this.redmineUrl && this.apiKey) {
      this.authenticationService
        .login(this.redmineUrl, this.apiKey, this.rememberMe)
        .subscribe(result => {
          this.userService.setUser(result);
          const redirect = this.authenticationService.redirectUrl
            ? this.authenticationService.redirectUrl
            : '/';
          this.router.navigate([redirect]);
        });
    }
  }

  logout() {
    this.authenticationService.logout();
    this.isLoggedIn = false;
  }
}
