import {
  Component,
  OnInit,
  AfterViewInit
} from '@angular/core';
import { Chart } from 'chart.js';
import { ErrorService } from 'src/app/services/error/error.service';
import { FormControl } from '@angular/forms';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class ReportsComponent
  implements OnInit, AfterViewInit {
  chart = [];
  chartData = [1, 2, 3, 4, 5, 6];
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  date = new FormControl(moment());

  constructor(
    private errorService: ErrorService
  ) {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.setChart();
  }

  setChart() {
    this.chart = new Chart('canvas', {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue'],
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
        deferred: { delay: 500 }
      }
    });
  }
}
