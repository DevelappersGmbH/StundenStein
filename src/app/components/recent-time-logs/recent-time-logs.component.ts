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
  dateList: Date[];
  timeLogMap : Map<Date, TimeLog[]>;
  unbookedTimeLogsMap : Map<Date, number>;
  numberOfUnbookedTimeLogs: number;

  ngOnInit() {
    this.numberOfUnbookedTimeLogs = 0;
    this.timeLogMap = new Map();
    this.unbookedTimeLogsMap = new Map();
    this.loadTimeLogs();
  }

  onDelete(deleted: number) {
    this.removeTimeLogFromList(deleted);
  }

  loadTimeLogs() {
    this.dataService.getTimeLogs(this.userService.getUser().id).subscribe(timeLogs => { 
      this.timeLogList = timeLogs;
      this.timeLogList.reverse();
      this.seperateDates();
      this.countUnbookedTimeLogs();
     });
  }

  //pls dont try to understand what i do here thanks
  seperateDates(){
    let seperateDates: Date[] = new Array();
    let dateExists: Boolean = false;
    for(var i = 0;  i < this.timeLogList.length; i++ ){
      var date = this.timeLogList[i].timeStopped;
      var matchingDate;
      for(var j = 0; j < seperateDates.length; j++){
        dateExists = false;
        var existingDate = seperateDates[j];
        if(this.compareDatesEqual(date, existingDate)){
          matchingDate = existingDate;
          dateExists = true;
          break;
        }
      }
      if(!dateExists){
        seperateDates.push(date);
        matchingDate = date;
        this.timeLogMap.set(matchingDate, new Array());
      }
      this.timeLogMap.get(matchingDate).push(this.timeLogList[i]);
    } 
    this.dateList = seperateDates;
  }

  compareDatesEqual(d1: Date, d2: Date){
    if(d1.getDay() == d2.getDay() && d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear()){
      return true;
    }
    return false;
  }

  removeTimeLogFromList(id: number){
    this.timeLogMap.forEach((value: TimeLog[], key: Date) => {
      const index = value.findIndex(entry => entry.id == id);
      if (index >= 0) {
        value.splice(index, 1);
      }
    });
  }

  countUnbookedTimeLogs(){
    this.timeLogMap.forEach((timeLogs: TimeLog[], date: Date) => {
      var unbookedTimeLogs = 0;
      timeLogs.forEach((timeLog: TimeLog) =>{
        if(!timeLog.booked){
          unbookedTimeLogs++;
          this.numberOfUnbookedTimeLogs++;
        }
      });
      this.unbookedTimeLogsMap.set(date,unbookedTimeLogs);
  });
  
  }
}
