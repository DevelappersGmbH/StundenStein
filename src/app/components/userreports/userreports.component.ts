declare var require: any;
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  HostListener
} from '@angular/core';
import { ErrorService } from '../../services/error/error.service';
import { TimeLog } from 'src/app/model/time-log.interface';
import { isNull, isUndefined } from 'util';

@HostListener('window:resize')
@Component({
  selector: 'app-userreports',
  templateUrl: './userreports.component.html',
  styleUrls: ['./userreports.component.scss']
})
export class UserReportsComponent
  implements OnInit, OnChanges {
  screenHeight;
  screenWidth;
  period = 0;
  date = new Date();
  bilCheck = false;
  periodArray = [];
  generalArray = [];
  selected = '0';
  pixelWidth;
  elementPosition;
  getSize;
  browserSize;
  browserWidth;
  setBrowserWidthOnInit;
  dwmlArray = [[], [], [], []];
  lastTimeLogsLength = 0;

  constructor(private errorService: ErrorService) {
    this.pixelWidth = require('string-pixel-width');
    this.elementPosition = require('element-position');
    this.getSize = require('get-size');
    this.browserSize = require('browser-size')();
    this.setBrowserWidthOnInit = this.browserSize.width;
    this.onResize();
  }

  @Input() timeLogs: TimeLog[] = [];

  onResize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  ngOnInit() {
    if (isUndefined(this.timeLogs)) {
      this.errorService.errorDialog(
        'Did not receive data from the dataService, wich distributes the project data.'
      );
    }
    if (this.timeLogs.length > 0) {
      if (this.timeLogs.length === this.lastTimeLogsLength && this.dwmlArray[this.period].length > 0) {
        this.generalArray = this.dwmlArray[this.period];
      } else {
        this.setWidth(this.setPeriod());
      }
    }
    this.lastTimeLogsLength = this.timeLogs.length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (typeof changes['timeLogs'] !== 'undefined') {
      const change = changes['timeLogs'];
      change.currentValue.forEach(log => {
        if (
          !isUndefined(log.comment) &&
          !isNull(log.comment) &&
          log.comment.length > 0
        ) {
          this.timeLogs.unshift(log);
        }
      });
    }
    this.ngOnInit();
  }

  setPeriod() {
    return this.period === 0
      ? this.timeLogs.filter(x => this.checkDay(x))
      : this.period === 1
      ? this.timeLogs.filter(x => this.checkWeek(x))
      : this.period === 2
      ? this.timeLogs.filter(x => this.checkMonth(x))
      : this.timeLogs.filter(x => this.checkLastMonth(x));
  }

  checkDay(value: TimeLog) {
    return (
      this.date.getDate() === value.timeStopped.getDate() &&
      this.date.getMonth() === value.timeStopped.getMonth() &&
      this.date.getFullYear() === value.timeStopped.getFullYear()
    );
  }

  checkWeek(value: TimeLog) {
    return (
      this.getWeekNumber(value.timeStopped) === this.getWeekNumber(this.date) &&
      this.date.getFullYear() === value.timeStopped.getFullYear()
    );
  }

  checkMonth(value: TimeLog) {
    return (
      this.date.getMonth() === value.timeStopped.getMonth() &&
      this.date.getFullYear() === value.timeStopped.getFullYear()
    );
  }

  checkLastMonth(value: TimeLog) {
    return this.date.getMonth() === 0
      ? value.timeStopped.getMonth() === 11 &&
          this.date.getFullYear() - 1 === value.timeStopped.getFullYear()
      : this.date.getMonth() - 1 === value.timeStopped.getMonth() &&
          this.date.getFullYear() - 1 === value.timeStopped.getFullYear();
  }

  getWeekNumber(d: Date): number {
    d = new Date(+d);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(
      ((d.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7
    );
    return weekNo;
  }

  setWidth(array: any[]) {
    let indexOfWidth,
      counter = 0,
      counterBillable = 0;
    const width = [];
    array.forEach(e => {
      if (
        width.find(function(element, index) {
          indexOfWidth = index;
          return e.project !== null
            ? element[0] === e.project.name
            : element[0] === 'No project assigned';
        })
      ) {
        width[indexOfWidth][1] += e.timeInHours;
        if (e.billable) {
          width[indexOfWidth][3] += e.timeInHours;
        }
      } else {
        const time = this.setTime(e.timeStarted, e.timeStopped, e.timeInHours);
        width.push([
          e.project !== null ? e.project.name : 'No project assigned',
          time,
          e.project !== null ? e.project.color : '#585a5e',
          e.billable ? time : 0,
          time,
          e.billable ? time : 0
        ]);
      }
      counter += e.timeInHours;
      if (e.billable) {
        counterBillable += e.timeInHours;
      }
    });
    width.forEach(e => {
      e[1] = Math.round((e[1] / counter) * 100);
      e[3] = Math.round((e[3] / counterBillable) * 100);
    });
    width.sort((a, b) => b[1] - a[1]);
    this.dwmlArray[this.period] = width;
    this.generalArray = width;
  }

  checkSameDayTimelog(start: Date, stop: Date, time: number) {
    return start.getDate() === stop.getDate() &&
      start.getMonth() === stop.getMonth() &&
      start.getFullYear() === stop.getFullYear()
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

  setTime(start: Date, stop: Date, time: number): number {
    return this.period === 0
      ? this.checkSameDayTimelog(start, stop, time)
      : this.period === 1
      ? this.checkSameWeekTimelog(start, stop, time)
      : this.checkSameWeekTimelog(start, stop, time);
  }

  checkBox(event) {
    event.checked ? (this.bilCheck = true) : (this.bilCheck = false);
  }

  getProjectName(i: number, bool: Boolean): string {
    const pixel =
      this.screenWidth -
      20 * (this.generalArray[i][!this.bilCheck ? 1 : 3] / 100);
    return this.pixelWidth(this.generalArray[i][!this.bilCheck ? 1 : 3], {
      size: 14
    }) <= pixel || bool
      ? this.generalArray[i][0]
      : this.generalArray[i][0].charAt(0);
  }

  getWidth(i: number): string {
    return this.generalArray[i][!this.bilCheck ? 1 : 3] + '%';
  }

  getColor(i: number): string {
    return this.generalArray[i][2];
  }

  selectedOption() {
    this.period = Number(this.selected);
    this.bilCheck = false;
    this.ngOnInit();
  }

  projectExists() {
    return isUndefined(this.generalArray) || this.generalArray.length === 0
      ? false
      : true;
  }

  getRequiredTime(i): string {
    let h, m;
    const temp = this.generalArray[i][!this.bilCheck ? 4 : 5];
    if (temp < 0.017) {
      return '00:01';
    }
    Math.floor(temp) < 10
      ? (h = '0' + Math.floor(temp))
      : (h = '' + Math.floor(temp));
    (temp % 1) * 60 < 10
      ? (m = '0' + Math.round((temp % 1) * 60))
      : (m = '' + Math.round((temp % 1) * 60));
    return h + ':' + m;
  }

  getPercentage(i): string {
    return this.generalArray[i][!this.bilCheck ? 1 : 3] + ' %';
  }

  getBillPercent(i): string {
    return this.bilCheck
      ? 100 + '% billable'
      : this.generalArray[i][1] + '% billable';
  }

  getBubblePos(i): string {
    const el1 = document.getElementById('chart' + i); // .style.cssText = "--my-var: #000";
    el1.style.cssText += 'right: 0';
    const temp = this.setBrowserWidthOnInit === this.browserSize.width ? 16 : 0;
    const browserWidth = this.browserSize.width - temp;
    const el = document.getElementById('chart' + i);
    const pos = this.elementPosition.getCoordinates(el);
    const value =
      Math.round(
        ((pos.left + this.getSize(el).width / 2) / browserWidth) * 100
      ) -
      8.5 +
      0.5 * i;
    return value > 80 ? '83%' : value < 5.5 ? '0%' : value + '%';
  }

  bubbleAtBorder(i) {
    return this.getBubblePos(i) === '83%'
      ? true
      : this.getBubblePos(i) === '0%'
        ? true
        : false;
  }
}
