import { Component, OnInit } from '@angular/core';
import { TimeLog } from 'src/app/model/time-log.interface';
import { UserService } from 'src/app/services/user/user.service';
import { Issue } from 'src/app/model/issue.interface';
import { Project } from 'src/app/model/project.interface';
import { User } from 'src/app/model/user.interface';

@Component({
  selector: 'app-recent-time-logs',
  templateUrl: './recent-time-logs.component.html',
  styleUrls: ['./recent-time-logs.component.scss']
})

export class RecentTimeLogsComponent implements OnInit {

  constructor() {}

  timeLogList: TimeLog[];

  ngOnInit() {
    this.loadTimeLogs();
  }

  clickedItem() { }

  loadTimeLogs() {
    this.timeLogList = this.createTimeLogsArray(1000);
  }

  createTimeLogsArray(numberOfTimeLogs) {
    const timeLogList = [];
    const project: Project = {
      id: 1,
      name: 'prototypeProject'
    };

    const user: User = {
      id: 1,
      name: 'prototypeUser'
    };

    const issue: Issue = {
      id: 1,
      subject: 'prototypeSubject',
      tracker: 'prototypeTracker',
      project: project,
      assignedTo: user
    };
    for (let i = 0; i < numberOfTimeLogs; i++) {
      const timeLog: TimeLog = {
        id: i,
        timeStarted: '10 AM',
        timeStopped: '12 PM',
        comment: '',
        timeInHours: 14,
        booked: true,
        hourGlassTimeBookingId: i,
        billable: false,
        issue: issue,
        project: project,
        user: user
      };
      timeLogList.push(timeLog);
    }
    return timeLogList;
  }

}
