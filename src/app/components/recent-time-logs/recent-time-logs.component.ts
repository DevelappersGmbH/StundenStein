import { Component, OnInit } from '@angular/core';
import { TimeLog } from 'src/app/model/time-log.interface';
import { DataService } from 'src/app/services/data/data.service';
import { Issue } from 'src/app/model/issue.interface';
import { Project } from 'src/app/model/project.interface';
import { User } from 'src/app/model/user.interface';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-recent-time-logs',
  templateUrl: './recent-time-logs.component.html',
  styleUrls: ['./recent-time-logs.component.scss']
})

export class RecentTimeLogsComponent implements OnInit {

  constructor(
    private dataService: DataService
    ) {
  }

  timeLogList: TimeLog[];

  ngOnInit() {
    this.loadTimeLogs();
  }

  clickedItem() { }

  loadTimeLogs() {
    this.dataService.getTimeLogs().subscribe(timeLogs => { this.timeLogList = timeLogs });
  }
}
