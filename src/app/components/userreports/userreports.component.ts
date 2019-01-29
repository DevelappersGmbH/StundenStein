import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { ErrorService } from '../../services/error/error.service';
import { isUndefined } from 'util';
import { TimeLog } from 'src/app/model/time-log.interface';

declare var require: any;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-userreports',
  templateUrl: './userreports.component.html',
  styleUrls: ['./userreports.component.scss']
})
export class UserReportsComponent implements OnInit, OnChanges {
  screenWidth;
  period = 0;
  bilCheck = false;
  generalArray = new Array();
  selected = '0';
  pixelWidth;
  date = new Date();
  firstInit = true;

  // constructor is loading various npm packages for scaling due to the info bubble
  constructor(private errorService: ErrorService, private ref: ChangeDetectorRef) {
    this.pixelWidth = require('string-pixel-width');
    this.onResize();
  }

  @Input() timeLogs: TimeLog[] = [];

  // function called when window is resizing due to the info bubble
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    this.firstInit = false;
  }

  ngOnInit() {
    if (isUndefined(this.timeLogs)) {
      this.errorService.errorDialog(
        'Did not receive data from the dataService, wich distributes the project data.'
      );
    } else if (this.timeLogs.length > 0) {
      // calculating the data
      this.setWidth(this.setPeriod());
    }
  }
  // function is called when @Input variable is updated
  ngOnChanges(changes: SimpleChanges): void {
    if (typeof changes['timeLogs'] !== 'undefined') {
      const change = changes['timeLogs'];
    }
    this.ngOnInit();
    setTimeout(() => {
      this.ref.markForCheck();
    }, 500);
  }

  // filtering the timelogs suitable to the time period that was selected by the user
  setPeriod() {
    return this.period === 0
      ? this.timeLogs.filter(x => this.checkDay(x))
      : this.period === 1
      ? this.timeLogs.filter(x => this.checkYesterday(x, true))
      : this.period === 2
      ? this.timeLogs.filter(x => this.checkWeek(x))
      : this.period === 3
      ? this.timeLogs.filter(x => this.checkLastWeek(x, true))
      : this.period === 4
      ? this.timeLogs.filter(x => this.checkMonth(x))
      : this.timeLogs.filter(x => this.checkLastMonth(x, true));
  }

  // the following functions check if the timelog that is passed from the setPeriod function is in corresponding period
  checkDay(value: TimeLog) {
    return this.compareDates(this.date, value.timeStopped);
  }

  checkYesterday(value: TimeLog, bool: boolean) {
    const date = new Date(new Date().setDate(this.date.getDate() - 1));
    return (bool
    ? this.compareDates(date, value.timeStarted) : false) ||
      this.compareDates(date, value.timeStopped);
    }

  checkWeek(value: TimeLog) {
    return (
      this.getWeekNumber(value.timeStopped) ===
        this.getWeekNumber(this.date) &&
        this.date.getFullYear() === value.timeStopped.getFullYear()
    );
  }

  checkLastWeek(value: TimeLog, bool: boolean) {
    return (( bool ? (this.getWeekNumber(value.timeStarted) ===
      this.getWeekNumber(new Date(new Date().setDate(this.date.getDate() - 7))) &&
      this.date.getFullYear() - (this.getWeekNumber(this.date) === 1 ? 1 : 0) === value.timeStarted.getFullYear()) : false) ||
      (this.getWeekNumber(value.timeStopped) === this.getWeekNumber(new Date(new Date().setDate(this.date.getDate() - 7))) &&
      this.date.getFullYear() - (this.getWeekNumber(this.date) === 1 ? 1 : 0) === value.timeStopped.getFullYear()));

  }

  checkMonth(value: TimeLog) {
    return (
      this.date.getMonth() === value.timeStopped.getMonth() &&
      this.date.getFullYear() === value.timeStopped.getFullYear()
    );
  }

  checkLastMonth(value: TimeLog, bool: boolean) {
    return ( bool ? (this.date.getMonth() === 0
      ? value.timeStarted.getMonth() === 11 &&
        this.date.getFullYear() - 1 === value.timeStarted.getFullYear()
      : this.date.getMonth() - 1 === value.timeStarted.getMonth() &&
        this.date.getFullYear() === value.timeStarted.getFullYear()) : false) ||
      this.date.getMonth() === 0
        ? value.timeStopped.getMonth() === 11 &&
          this.date.getFullYear() - 1 === value.timeStopped.getFullYear()
        : this.date.getMonth() - 1 === value.timeStopped.getMonth() &&
          this.date.getFullYear() === value.timeStopped.getFullYear();
  }

  // compares two Date objects if they are containing the same day (time excluded)
  compareDates(date1: Date, date2: Date) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  // claculates the week number of a passed date object
  getWeekNumber(d: Date): number {
    d = new Date(+d);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7);
  }

  // setting up and sorting an array that contains all the data the component needs to resort to
  setWidth(array: any[]) {
    let indexOfWidth,
      counter = 0,
      counterBillable = 0;
    const width = new Array();
    array.forEach(e => {
      const time = this.timeForPreviousDay(e)
      ? this.setTime(e.timeStarted, e.timeStopped, e.timeInHours)
      : 24 - (e.timeStarted.getHours() + ((e.timeStarted.getMinutes() / 3) * 5) / 100);
      if (
        width.find(function(element, index) {
          indexOfWidth = index;
          return e.project !== null
            ? element[0] === e.project.name
            : element[0] === 'No project assigned';
        })
      ) {
        width[indexOfWidth][1] += time;
        width[indexOfWidth][4] += time;
        if (e.billable) {
          width[indexOfWidth][3] += time;
          width[indexOfWidth][5] += time;
        }
      } else {
        width.push([
          e.project !== null ? e.project.name : 'No project assigned',
          time,
          e.project !== null ? e.project.color : '#585a5e',
          e.billable ? time : 0,
          time,
          e.billable ? time : 0
        ]);
      }
      counter += time;
      if (e.billable) {
        counterBillable += time;
      }
    });
    width.forEach(e => {
      e[1] = Math.round((e[1] / counter) * 100);
      e[3] === 0
        ? (e[3] = 0)
        : (e[3] = Math.round((e[3] / counterBillable) * 100));
    });
    this.generalArray = this.filterAndSort(width);
  }

  // filters and sorts the generalArray
  filterAndSort(array: Array<any>): Array<any> {
    array.sort((a, b) => a[0].localeCompare(b[0]));
    const npaValue = array.find(function(element) {
      return element[0] === 'No project assigned';
    });
    if (npaValue !== undefined) {
      array = array.filter(x => this.npaFinder(x));
      array.push(npaValue);
    }
    return array;
  }

  // check for timelogs passing midnight
  timeForPreviousDay(e: TimeLog): boolean {
    return this.period === 0
      ? this.checkDay(e)
      : this.period === 1
      ? this.checkYesterday(e, false)
      : this.period === 2
      ? this.checkWeek(e)
      : this.period === 3
      ? this.checkLastWeek(e, false)
      : this.period === 4
      ? this.checkMonth(e)
      : this.checkLastMonth(e, false);
  }

  // due to the filter function above
  npaFinder(element: Array<any>) {
    return element[0] !== 'No project assigned';
  }

  // checks if a timelog is passing midnight and returns the duration of a timlog in hours
  setTime(start: Date, stop: Date, time: number): number {
    return this.period === 0 || this.period === 1
      ? this.checkSameDayTimelog(start, stop, time)
      : this.period === 2 || this.period === 3
      ? this.checkSameWeekTimelog(start, stop, time)
      : this.checkSameMonthTimelog(start, stop, time);
  }

  // the following functions are called by the setTime function in order to compare two date objects if they contain the same day
  checkSameDayTimelog(start: Date, stop: Date, time: number) {
    return this.compareDates(start, stop)
      ? time
      : stop.getHours() + ((stop.getMinutes() / 3) * 5) / 100;
  }

  checkSameWeekTimelog(start: Date, stop: Date, time: number) {
    return this.getWeekNumber(start) === this.getWeekNumber(stop)
      ? time
      : stop.getHours() + ((stop.getMinutes() / 3) * 5) / 100;
  }

  checkSameMonthTimelog(start: Date, stop: Date, time: number) {
    return start.getMonth() === stop.getMonth()
      ? time
      : (stop.getDate() - 1) * 24 +
          stop.getHours() +
          ((stop.getMinutes() / 3) * 5) / 100;
  }

  // called when the "show only billable" checkbox is clicked by user
  checkBox(event) {
    this.onResize();
    event.checked ? (this.bilCheck = true) : (this.bilCheck = false);
  }

  // called when sth from the dropdown is selected
  selectedOption() {
    this.onResize();
    this.period = Number(this.selected);
    this.bilCheck = false;
    this.ngOnInit();
  }

  // returns false if there is no project for the selected period
  projectExists() {
    const check = this.bilCheck
      ? !this.generalArray.every(x => this.noProjectIsBillable(x))
      : true;
    return (
      !isUndefined(this.generalArray) && this.generalArray.length > 0 && check
    );
  }

  // for the function above
  noProjectIsBillable(e): boolean {
    return e[3] === 0;
  }

  // the following "get"-function returns are corresponding to the project id "i"

  // returns the project name
  getProjectName(i: number, bool: Boolean): string {
    const pixel =
      (this.screenWidth - 20) *
      (this.generalArray[i][!this.bilCheck ? 1 : 3] / 100);
    return this.pixelWidth(this.generalArray[i][0], {
      size: 15
    }) <= pixel || bool
      ? this.generalArray[i][0]
      : this.generalArray[i][0].charAt(0);
  }

  // returns the width of the table td
  getWidth(i: number): string {
    return this.generalArray[i][!this.bilCheck ? 1 : 3] + '%';
  }

  // returns the project color for the table td and the shown name
  getColor(i: number): string {
    return this.generalArray[i][2];
  }

  // the following functions return data shown in the bubble that is popping up by hovering over a project
  getRequiredTime(i): string {
    return this.getTimeInHHMM(this.generalArray[i][!this.bilCheck ? 4 : 5]);
  }

  getPercentage(i): string {
    return this.generalArray[i][!this.bilCheck ? 1 : 3] + ' %';
  }

  getBillPercent(i): string {
    return this.generalArray[i][1] <= this.generalArray[i][3] || this.bilCheck
      ? '100% billable'
      : Math.round((this.generalArray[i][3] / this.generalArray[i][1]) * 100) +
          '% billable';
  }

  getTotalTime(bool: boolean): string {
    return this.getTimeInHHMM(
      this.generalArray.reduce((a, b) => a + b[bool ? 5 : 4], 0)
    );
  }

  // calculate the timeInHours in a HH:MM format
  getTimeInHHMM(temp: number): string {
    let h, m;
    if (temp < 0.017) {
      return '00:01';
    }
    Math.floor(temp) < 10
      ? (h = '0' + Math.floor(temp))
      : (h = Math.floor(temp));
    (temp % 1) * 60 < 10
      ? (m = '0' + Math.round((temp % 1) * 60))
      : (m = Math.round((temp % 1) * 60));
    return h + ':' + m;
  }

  // returning the percentaged number of the position of the bubble explained above
  getBubblePos(i): string {
    const el = document.getElementById('chart' + i);
    let value =
      ((el.getBoundingClientRect().left + el.offsetWidth / 2) /
        this.screenWidth) *
        100 -
      9;
    value += value * 0.025;
    return value > 83 ? '83%' : value < 1 ? '0%' : value + '%';
  }

  /*didnt found an efficient method for the corresponding position for the bubble arrow
    at the border of the screen so I just decided to dont show it there*/
  bubbleAtBorder(i) {
    return this.getBubblePos(i) === '83%'
      ? true
      : this.getBubblePos(i) === '0%'
      ? true
      : false;
  }
}
