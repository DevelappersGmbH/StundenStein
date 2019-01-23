import { ReloadTriggerService } from './../../services/reload-trigger.service';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Issue } from 'src/app/model/issue.interface';
import { Project } from './../../model/project.interface';
import { TimeLog } from 'src/app/model/time-log.interface';

@Component({
  selector: 'app-recent-time-logs',
  templateUrl: './recent-time-logs.component.html',
  styleUrls: ['./recent-time-logs.component.scss']
})
export class RecentTimeLogsComponent implements OnInit, OnChanges {
  constructor(private reloadTriggerService: ReloadTriggerService) {
    this.listLoading = true;
    this.numberOfUnbookedTimeLogs = 0;
    this.timeLogMap = new Map();
    this.unbookedTimeLogsMap = new Map();
  }

  timeLogList: TimeLog[]; // holds all timeLogs
  dateList: Date[]; // holds all dates (matcard for every date)
  timeLogMap: Map<Date, TimeLog[]>; // corresponding timeLog-array for each date (matlist for every date)
  unbookedTimeLogsMap: Map<Date, number>; // maps number of unbooked timeLogs to each date (for Badge on each date)
  numberOfUnbookedTimeLogs: number; // for Badge at headline
  listLoading: boolean; // loading spinner
  loadingMoreTimeLogs: boolean; // shows if load-more button should be visible

  @Input() projects: Project[];
  @Input() issues: Issue[];
  @Input() timeLogs: TimeLog[];
  @Input() allTimeLogsLoaded: boolean;

  ngOnInit() {}

  // recalculates entire List with the new TimeLogs
  ngOnChanges(changes: SimpleChanges) {
    this.listLoading = true;
    if (typeof changes['timeLogs'] !== 'undefined') {
      const change = changes['timeLogs'];
      this.timeLogList = change.currentValue;
      this.seperateDates();
      this.countUnbookedTimeLogs();
      this.listLoading = false;
    }
    this.loadingMoreTimeLogs = false;
  }

  // creates array with all existing dates, maps arrya of corresponding timeLogs to each date
  seperateDates() {
    this.timeLogMap = new Map();
    const seperateDates: Date[] = new Array();
    this.timeLogList.forEach(timeLog => {
      let dateExists: Boolean = false;
      let newDate: Date;
      // check if date already exists in map
      seperateDates.forEach(date => {
        if (this.compareDatesEqual(timeLog.timeStarted, date)) {
          dateExists = true;
          newDate = date;
        }
      });
      // create new array and insert it at the date
      if (!dateExists) {
        newDate = this.createEmptyDate(timeLog.timeStarted);
        seperateDates.push(newDate);
        this.timeLogMap.set(newDate, new Array());
      }
      // put the timeLog to the list corresponding to its date
      this.timeLogMap.get(newDate).push(timeLog);
    });
    this.dateList = seperateDates; // create the new dateList
  }

  createEmptyDate(date: Date) {
    const newDate = new Date();
    newDate.setUTCDate(date.getUTCDate());
    newDate.setUTCMonth(date.getUTCMonth());
    newDate.setUTCFullYear(date.getUTCFullYear());
    newDate.setUTCHours(0);
    newDate.setUTCMinutes(0);
    newDate.setUTCSeconds(0);
    newDate.setUTCMilliseconds(0);
    return newDate;
  }

  // compare two dates, ignoring hours, minutes and seconds
  compareDatesEqual(d1: Date, d2: Date) {
    if (
      d1.getUTCDate() === d2.getUTCDate() &&
      d1.getUTCMonth() === d2.getUTCMonth() &&
      d1.getUTCFullYear() === d2.getUTCFullYear()
    ) {
      return true;
    }
    return false;
  }

  // maps number of unbooked timeLogs to each date
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

  loadMoreTimeLogs() {
    this.loadingMoreTimeLogs = true;
    this.reloadTriggerService.triggerLoadMoreTimeLogs();
  }
}
