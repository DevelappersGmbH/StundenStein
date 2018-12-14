import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
  } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { Issue } from 'src/app/model/issue.interface';
import { Project } from './../../model/project.interface';
import { TimeLog } from 'src/app/model/time-log.interface';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-recent-time-logs',
  templateUrl: './recent-time-logs.component.html',
  styleUrls: ['./recent-time-logs.component.scss']
})
export class RecentTimeLogsComponent implements OnInit, OnChanges {
  constructor(
    private dataService: DataService,
    private userService: UserService
  ) {
    this.listLoading = true;
    this.numberOfUnbookedTimeLogs = 0;
    this.timeLogMap = new Map();
    this.unbookedTimeLogsMap = new Map();
  }

  timeLogObservablesList: TimeLog[];
  dateList: Date[];
  timeLogMap: Map<Date, TimeLog[]>;
  unbookedTimeLogsMap: Map<Date, number>;
  numberOfUnbookedTimeLogs: number;
  listLoading: boolean;

  @Input() projects: Project[];
  @Input() issues: Issue[];
  @Input() timeLogs: TimeLog[];

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    this.listLoading = true;
    if (typeof changes['timeLogs'] !== 'undefined') {
      const change = changes['timeLogs'];
      this.timeLogObservablesList = change.currentValue;
      this.seperateDates();
      this.countUnbookedTimeLogs();
      this.listLoading = false;
    }
  }

  seperateDates() {
    this.timeLogMap = new Map();
    const seperateDates: Date[] = new Array();
    this.timeLogObservablesList.forEach(timeLog => {
      let dateExists: Boolean = false;
      let newDate: Date;
      seperateDates.forEach(date => {
        if (this.compareDatesEqual(timeLog.timeStarted, date)) {
          dateExists = true;
          newDate = date;
        }
      });
      if (!dateExists) {
        newDate = timeLog.timeStarted;
        seperateDates.push(newDate);
        this.timeLogMap.set(newDate, new Array());
      }
      this.timeLogMap.get(newDate).push(timeLog);
    });
    this.dateList = seperateDates;
  }

  compareDatesEqual(d1: Date, d2: Date) {
    if (
      d1.getDay() == d2.getDay() &&
      d1.getMonth() == d2.getMonth() &&
      d1.getFullYear() == d2.getFullYear()
    ) {
      return true;
    }
    return false;
  }

  countUnbookedTimeLogs() {
    this.numberOfUnbookedTimeLogs = 0;
    this.timeLogMap.forEach((timeLogs: TimeLog[], date: Date) => {
      let unbookedTimeLogs = 0;
      timeLogs.forEach((timeLog: TimeLog) => {
        if (!timeLog.booked) {
          unbookedTimeLogs++;
          this.numberOfUnbookedTimeLogs++;
        }
      });
      this.unbookedTimeLogsMap.set(date, unbookedTimeLogs);
    });
  }
}
