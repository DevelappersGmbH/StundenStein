import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
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

    this.dataService
      .getTimeLogs(this.userService.getUser().id)
      .subscribe(tls => {
        this.timelogs = tls;
      });

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
}
