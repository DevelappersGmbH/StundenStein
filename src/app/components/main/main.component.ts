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

  private pageSize = 100; // Max of Entries loadable using one request
  private timeLogCountOnServer: number;
  allTimeLogsLoaded = false;
  private stoppedAtOffset: number;
  private stoppedAtItemsToDownload: number;

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

    this.getTimeLogsIncrementally(this.userService.getUser().id);

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

    this.reloadTriggerService.loadMoreTimeLogs.subscribe(x =>
      this.loadMoreTimeLogs()
    );
  }

  private getTimeLogsIncrementally(userId: number = -1) {
    this.dataService.getTimeLogCount(userId).subscribe(count => {
      const offset = count - this.pageSize;
      this.timeLogCountOnServer = count;
      this.getTimeLogs(offset >= 0 ? offset : 0, count, 1, userId);
    });
  }

  private loadMoreTimeLogs() {
    this.getTimeLogs(
      this.stoppedAtOffset,
      this.stoppedAtItemsToDownload,
      1,
      this.userService.getUser().id
    );
  }

  private getTimeLogs(
    offset: number,
    itemsToDownload: number,
    pagesToDownload: number,
    userId: number = -1
  ) {
    this.dataService
      .getTimeLogs(offset, this.pageSize, userId)
      .subscribe(logs => {
        logs.forEach(log => {
          const index = this.timelogs.findIndex(entry => entry.id === log.id);
          if (index > -1) {
            this.timelogs.splice(index, 1, log);
          } else {
            this.timelogs.push(log);
          }
          this.timelogs = this.timelogs
            .sort((a, b) => {
              return (
                <any>new Date(b.timeStarted) - <any>new Date(a.timeStarted)
              );
            })
            .slice();
        });
        const count: number = itemsToDownload - logs.length;
        const newoffset: number = count - this.pageSize;

        if (count <= 0) {
          this.allTimeLogsLoaded = true;
          return;
        }

        if (pagesToDownload - 1 > 0) {
          this.getTimeLogs(
            newoffset >= 0 ? newoffset : 0,
            count,
            pagesToDownload - 1,
            userId
          );
        } else {
          // Happens if less pages are loaded, than pages are stored on server
          this.allTimeLogsLoaded = false;
          this.stoppedAtOffset = newoffset;
          this.stoppedAtItemsToDownload = count;
        }
      });
  }
}
