import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { TrackerService } from 'src/app/services/tracker/tracker.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  username: string;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private userService: UserService,
    private trackerService: TrackerService
  ) {}

  ngOnInit() {
    this.username = this.userService.getUser().name;
  }

  logout() {
    this.trackerService.logout();
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
