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
    private userService: UserService
    ) {
  }

  timeLogObservablesList: TimeLog[];
  dateList: Date[];
  timeLogMap : Map<Date, TimeLog[]>;
  unbookedTimeLogsMap : Map<Date, number>;
  numberOfUnbookedTimeLogs: number;
  listLoading : boolean;

  ngOnInit() {
    this.numberOfUnbookedTimeLogs = 0;
    this.timeLogMap = new Map();
    this.unbookedTimeLogsMap = new Map();
    this.loadTimeLogs();
  }


  onTimeLogDelete(deleted: number) {
    this.removeTimeLogFromList(deleted);
  }

  loadTimeLogs() {
    this.listLoading = true;
    this.dataService.getTimeLogs(this.userService.getUser().id).subscribe(timeLogs => { 
      this.timeLogObservablesList = timeLogs.reverse();
      this.seperateDates();
      this.countUnbookedTimeLogs();
      this.listLoading = false;
     });
  }

  //pls dont try to understand what i do here thanks
  seperateDates(){
    let seperateDates: Date[] = new Array();
    let dateExists: Boolean = false;
    for(var i = 0;  i < this.timeLogObservablesList.length; i++ ){
      var date = this.timeLogObservablesList[i].timeStopped;
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
      this.timeLogMap.get(matchingDate).push(this.timeLogObservablesList[i]);
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
      if(value.length == 0){
        const dateIndex = this.dateList.findIndex(date => date == key);
        if(index >= 0){
          this.dateList.splice(dateIndex, 1);
        }
      }
    });
    this.countUnbookedTimeLogs();
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
