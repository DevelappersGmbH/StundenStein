import { Component, OnInit } from '@angular/core';
import { TimeLog } from 'src/app/model/time-log.interface';
import { DataService } from 'src/app/services/data/data.service';
import { Issue } from 'src/app/model/issue.interface';
import { Project } from 'src/app/model/project.interface';
import { User } from 'src/app/model/user.interface';
import { Observable, forkJoin } from 'rxjs';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-recent-time-logs',
  templateUrl: './recent-time-logs.component.html',
  styleUrls: ['./recent-time-logs.component.scss']
})

export class RecentTimeLogsComponent implements OnInit {

  constructor(
    private dataService: DataService,
    private userService: UserService
    ) {
  }

  timeLogList: TimeLog[];

  ngOnInit() {
    this.loadTimeLogs();
  }

  clickedItem() { }

  loadTimeLogs() {
    this.dataService.getTimeLogs(this.userService.getUser().id).subscribe(timeLogs => { this.timeLogList = timeLogs });
  }
}
