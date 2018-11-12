import { Component, OnInit } from '@angular/core';
import { TimeLog } from 'src/app/model/time-log.interface';
import { UserService } from 'src/app/services/user/user.service';
import { Issue } from 'src/app/model/issue.interface';
import { Project } from 'src/app/model/project.interface';

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

  loadTimeLogs(){
    this.timeLogList = [];
    var project = {
      id: 1,
      name: "prototypeProject"
    };

    var user = {
      id: 1,
      name: "prototypeUser"
    };

    var issue = {
      id: 1,
      subject: "prototypeSubject",
      tracker: "prototypeTracker",
      project: project,
      assignedTo: user
    };
    for(let i=0;i<10;i++){
      var timeLog = {
      id: i,
      timeStarted: "10AM",
      timeStopped: "12 PM",
      comment: "",
      timeInHours: 14,
      booked: true,
      hourGlassTimeBookingId: i,
      billable: false,
      issue: issue,
      project: project,
      user: user
      };
      this.timeLogList.push(timeLog);
    }
  }

}
