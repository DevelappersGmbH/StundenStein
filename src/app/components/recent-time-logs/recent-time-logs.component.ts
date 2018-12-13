import { ReloadTriggerService } from './../../services/reload-trigger.service';
import { Component, OnInit } from '@angular/core';
import { TimeLog } from 'src/app/model/time-log.interface';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-recent-time-logs',
  templateUrl: './recent-time-logs.component.html',
  styleUrls: ['./recent-time-logs.component.scss']
})

export class RecentTimeLogsComponent implements OnInit {

  constructor(
    private dataService: DataService,
    private userService: UserService,
    private reloadTriggerService :ReloadTriggerService
    ) {
  }

  timeLogObservablesList: TimeLog[];
  dateList: Date[];
  timeLogMap : Map<Date, TimeLog[]>;
  unbookedTimeLogsMap : Map<Date, number>;
  numberOfUnbookedTimeLogs: number;
  listLoading : boolean;

  ngOnInit() {
    this.unbookedTimeLogsMap = new Map();
    this.numberOfUnbookedTimeLogs = 0;
    this.timeLogMap = new Map();
    this.loadTimeLogs();
    this.reloadTriggerService.timeLogDeleted.subscribe(data => {
      this.onTimeLogDelete(data);
    });
    this.reloadTriggerService.timeLogAdded.subscribe(data => {
      this.onTimeLogAdded(data);
    });
    this.reloadTriggerService.timeLogUpdated.subscribe(date => {
      this.onTimeLogUpdated(data);
    });
  }

  onTimeLogUpdated(id: number){
    this.refreshList();
  }

  onTimeLogAdded(timeLog: TimeLog){
    this.timeLogObservablesList.push(timeLog);
    this.seperateDates();
    this.countUnbookedTimeLogs();
  }

  refreshList(){
    this.listLoading = true;
    this.seperateDates();
    this.countUnbookedTimeLogs();
    this.listLoading = false;
  }

  onTimeLogDelete(id: number) {
    this.timeLogMap.forEach((value: TimeLog[], key: Date) => {
      const index = value.findIndex(entry => entry.id == id);
      if (index >= 0) {
        value.splice(index, 1);
      }
      if(value.length == 0){
        const dateIndex = this.dateList.findIndex(date => date == key);
        if(index >= 0){
          this.dateList.splice(dateIndex, 1);
        }
      }
    });
    this.refreshList();
  }

  loadTimeLogs() {
    this.listLoading = true;
    this.dataService.getTimeLogs(this.userService.getUser().id).subscribe(timeLogs => { 
      this.timeLogObservablesList = timeLogs.reverse();
      this.refreshList();
      this.listLoading = false;
     });
  }

  seperateDates(){
    this.timeLogMap = new Map();
    let seperateDates: Date[] = new Array();
    this.timeLogObservablesList.forEach(timeLog => {
      let dateExists: Boolean = false;
      let newDate: Date;
      seperateDates.forEach(date => {
        if(this.compareDatesEqual(timeLog.timeStarted, date)){
          dateExists = true;
          newDate = date;
        }
      });
      if(!dateExists){
        newDate = timeLog.timeStarted;
        seperateDates.push(newDate);
        this.timeLogMap.set(newDate, new Array());
      }
      this.timeLogMap.get(newDate).push(timeLog);
    });
    this.dateList = seperateDates;
  }

  compareDatesEqual(d1: Date, d2: Date){
    if(d1.getDay() == d2.getDay() && d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear()){
      return true;
    }
    return false;
  }

  countUnbookedTimeLogs(){
    this.numberOfUnbookedTimeLogs = 0;
    this.timeLogMap.forEach((timeLogs: TimeLog[], date: Date) => {
      let unbookedTimeLogs = 0;
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
