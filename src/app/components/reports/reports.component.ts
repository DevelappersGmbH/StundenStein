import { Component, OnInit, AfterViewInit, Input, AfterContentInit } from '@angular/core';
import { Chart } from 'chart.js';
import { ErrorService } from 'src/app/services/error/error.service';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { TimeLog } from 'src/app/model/time-log.interface';
import { default as _rollupMoment } from 'moment';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL'
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class ReportsComponent implements OnInit, AfterViewInit, AfterContentInit {
  chart = new Array();
  chartData = new Array();
  chartLabel = new Array();
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  date = new FormControl(moment());
  startDate = new Date();
  endDate = new Date();
  generalArray = new Array();
  tempDate;
  today = new Date();

  constructor(private errorService: ErrorService) {}

  @Input() timeLogs: TimeLog[] = [];

  ngOnInit() {
    if (this.chart.length === 0) {
      this.chartData = [this.today.getDate() + '.' + this.today.getMonth() + 1];
    }
  }

  ngAfterViewInit() {
    this.setChart();
  }

  ngAfterContentInit() {
  }

  setChart() {
    this.chart = new Chart('canvas', {
      type: 'bar',
      data: {
        labels: this.chartLabel,
        datasets: [
          {
            data: this.chartData,
            backgroundColor: '#1b52aa'
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        },
        // deferred: { delay: 500 }
      }
    });
  }

  addEvent(event: MatDatepickerInputEvent<any>, bool: Boolean) {
    bool ? this.startDate = event.value._d : this.endDate = event.value._d;
    this.startDate.getTime() > this.endDate.getTime()
    ? this.errorService.errorDialog('End date has to be higher than start date.')
    : this.setOverView(this.setPeriod());
  }

  checkDay(start: Date, stop: Date) {
    return start.getTime() <= stop.getTime();
  }

  setPeriod() {
    return this.timeLogs.filter(x => this.arrayFilter(x));
  }

  arrayFilter(x) {
    return x.timeStopped.getTime() >= this.startDate.getTime() &&
    x.timeStopped.getTime() <= this.endDate.getTime();
  }

  checkSameDate(date1: Date, date2: Date) {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }

  setOverView(array: any[]) {
    console.log(array);
    let indexOfWidth: number;
    const temp = new Array();
    array.forEach(e => {
      if (
        temp.find(function(element, index) {
          indexOfWidth = index;
          console.log(element);
          console.log(e);
          return element[2] === e.timeStopped.getDate() &&
          element[2].getMonth() === e.timeStopped.getMonth() &&
          element[2].getFullYear() === e.timeStopped.getFullYear();
        })
      ) {
        temp[indexOfWidth][0] += e.timeInHours;
        /*if (e.billable) {
          temp[indexOfWidth][1] += e.timeInHours;
        }*/
      } else {
        temp.push([
          e.timeInHours,
          e.timeStopped.getTime(),
          e.timeStopped
        ]);
      }
    });
    const temp3 = Math.floor((this.endDate.getTime() - this.startDate.getTime()) / 1000 / 60 / 60 / 24);
    const arrayTemp = new Array();
    for (let i = temp3; i >= 0; i--) {
      const date2 = new Date();
      const date = new Date();
      date2.setDate(date.getDate() - i);
      if (temp.find(x => this.checkSameDate(x[2], date2))) {
        const el = temp.find(x => this.checkSameDate(x[2], date2));
        arrayTemp.push([el[0]]);
      } else {
        arrayTemp.push([0]);
      }
    }
    this.chartData = arrayTemp;
    this.setChartData();
  }

  setWidth(array: any[]) {
    console.log('setWidth');
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
        width.push([
          e.project !== null ? e.project.name : 'No project assigned',
          e.timeInHours,
          e.project !== null ? e.project.color : '#585a5e',
          e.billable ? e.timeInHours : 0,
          e.timeInHours,
          e.billable ? e.timeInHours : 0
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
    this.generalArray = width;
    this.setChartData();
  }

  setChartData() {
    const date = new Date();
    const date2 = new Date();
    const array = new Array();
    const temp = Math.floor((this.endDate.getTime() - this.startDate.getTime()) / 1000 / 60 / 60 / 24);
    for (let i = temp; i >= 0; i--) {
      date2.setDate(date.getDate() - i);
      array.push([date2.getDate() + '.' + date2.getMonth() + 1]);
    }
    this.chartLabel = array;
    this.ngAfterViewInit();
  }
}
