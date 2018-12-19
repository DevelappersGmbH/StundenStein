import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { environment } from 'src/environments/environment';
import { Issue } from 'src/app/model/issue.interface';
import { Project } from 'src/app/model/project.interface';
import { ReloadTriggerService } from 'src/app/services/reload-trigger.service';
import { TimeLog } from 'src/app/model/time-log.interface';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  projects: Project[] = [];
  issues: Issue[] = [];
  timelogs: TimeLog[] = [];

  constructor(
    private dataService: DataService,
    private userService: UserService,
    private reloadTriggerService: ReloadTriggerService
  ) {}

  ngOnInit() {
    this.dataService.getProjects().subscribe(ps => {
      this.projects = ps;
    });

    this.dataService.getIssues().subscribe(is => {
      this.issues = is;
    });

    this.getAllTimeLogsInkrementally();

    this.reloadTriggerService.timeLogAdded.subscribe(timelog => {
      this.timelogs.push(timelog);
      this.timelogs = this.timelogs.slice().sort((a, b) => {
        return <any>new Date(b.timeStarted) - <any>new Date(a.timeStarted);
      });
    });

    this.reloadTriggerService.timeLogUpdated.subscribe(timelog => {
      const index = this.timelogs.findIndex(entry => entry.id === timelog.id);
      if (index >= -1) {
        this.timelogs[index] = timelog;
      }
      this.timelogs = this.timelogs.slice().sort((a, b) => {
        return <any>new Date(b.timeStarted) - <any>new Date(a.timeStarted);
      });
    });

    this.reloadTriggerService.timeLogDeleted.subscribe(id => {
      const index = this.timelogs.findIndex(entry => entry.id === id);
      if (index >= -1) {
        this.timelogs.splice(index, 1);
      }
      this.timelogs = this.timelogs.slice().sort((a, b) => {
        return <any>new Date(b.timeStarted) - <any>new Date(a.timeStarted);
      });
    });
  }

  private getAllTimeLogsInkrementally() {
    this.dataService.getTimeLogCount().subscribe(count => {
      const limit = 100; // Max of Entries loadable using one request
      const offset = count - limit;
      this.getTimeLogs(
        offset >= 0 ? offset : 0,
        limit,
        count,
        this.userService.getUser().id
      );
    });
  }

  private getTimeLogs(
    offset: number,
    limit: number,
    itemsToDownload: number,
    userId: number = -1
  ) {
    this.dataService.getTimeLogs(offset, limit, userId).subscribe(logs => {
      logs.forEach(log => {
        const index = this.timelogs.findIndex(entry => entry.id === log.id);
        if (index > -1) {
          this.timelogs.splice(index, 1, log);
        } else {
          this.timelogs.push(log);
        }
        this.timelogs = this.timelogs.slice();
        const count: number = itemsToDownload - logs.length;
        const newoffset: number = count - limit;
        if (count > 0) {
          this.getTimeLogs(
            newoffset >= 0 ? newoffset : 0,
            limit,
            count,
            userId
          );
        }
      });
    });
  }
}
