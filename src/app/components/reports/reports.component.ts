import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
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
import { isNull, isUndefined } from 'util';

const moment = _rollupMoment || _moment;

export interface DataSet {
  label: string;
  data: Array<number>;
  backgroundColor: string;
}

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
export class ReportsComponent implements OnInit, OnChanges {
  chart: Chart;
  pieChart = new Array();
  chartData = new Array();
  chartLabel = new Array();
  periodArray = new Array();
  minDate = new Date(2000, 0, 1);
  maxDate = new Date(new Date().setHours(0, 0, 0, 0));
  date: FormControl;
  startDate: Date;
  endDate = new Date(new Date().setHours(0, 0, 0, 0));
  today = new Date(new Date().setHours(0, 0, 0, 0));
  dateInit: FormControl;
  detailChartData = new Array();
  detailChartBgColor = new Array();
  detailChartLabel = new Array();
  isVisible = false;

  constructor(private errorService: ErrorService) {
    const myDate = new Date(new Date().setHours(0, 0, 0, 0));
    myDate.setDate(this.today.getDate() - 7);
    this.startDate = myDate;
    this.dateInit = new FormControl(moment(this.startDate));
    this.date = new FormControl(moment(this.endDate));
    Chart.defaults.global.legend.display = false;
    this.chartPlugin();
  }

  @Input() timeLogs: TimeLog[] = [];

  ngOnInit() {
    this.periodArray = this.setPeriod();
    this.setOverView(this.periodArray);
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (typeof changes['timeLogs'] !== 'undefined') {
      const change = changes['timeLogs'];
    }
    this.ngOnInit();
  }

  chartPlugin() {
    Chart.plugins.register({
      beforeDraw: function(chartInstance, easing) {
        if (chartInstance.config.options.tooltips.onlyShowForDatasetIndex) {
          const tooltipsToDisplay =
            chartInstance.config.options.tooltips.onlyShowForDatasetIndex;
          const active = chartInstance.tooltip._active || [];
          if (active.length > 0) {
            if (tooltipsToDisplay.indexOf(active[0]._datasetIndex) === -1) {
              chartInstance.tooltip._model.opacity = 0;
            }
          }
        }
      }
    });
  }

  addEvent(event: MatDatepickerInputEvent<any>, bool: Boolean) {
    const startDateBackup = this.startDate;
    const endDateBackup = this.endDate;
    bool ? (this.startDate = event.value._d) : (this.endDate = event.value._d);
    if (this.startDate.getTime() + 2 * 86400000 > this.endDate.getTime()) {
      this.startDate = startDateBackup;
      this.endDate = endDateBackup;
      this.date = new FormControl(moment(this.endDate));
      this.dateInit = new FormControl(moment(this.startDate));
      this.startDate.getTime() > this.endDate.getTime()
        ? this.errorService.errorDialog(
            'End date has to be higher than start date.'
          )
        : this.errorService.errorDialog(
            'There has to be at least a difference of two days.'
          );
    }
    this.ngOnInit();
  }

  barClick(event, array) {
    if (array !== undefined) {
      if (array[0] !== undefined) {
        if (this.chart.data.datasets[0].data[array[0]._index] > 0) {
          this.setDetailChart(array[0]._index);
          this.setPieChart();
        }
      }
    }
  }

  dateToDDMM(date: Date) {
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const month =
      date.getMonth() + 1 < 10
        ? '0' + (date.getMonth() + 1)
        : date.getMonth() + 1;
    return day + '.' + month;
  }

  checkDay(start: Date, stop: Date) {
    return start.getTime() <= stop.getTime();
  }

  setPeriod() {
    return this.timeLogs.filter(x => this.arrayFilter(x));
  }

  arrayFilter(x: TimeLog) {
    const time = x.timeStopped;
    time.setHours(0, 0, 0, 0);
    return (
      time.getTime() >= this.startDate.getTime() &&
      time.getTime() <= this.endDate.getTime()
    );
  }

  checkSameDate(date1: Date, date2: Date) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  setOverView(array: any[]) {
    let indexOfWidth: number;
    const temp = new Array();
    array.forEach(e => {
      if (
        temp.find(function(element, index) {
          indexOfWidth = index;
          return (
            element[1].getDate() === e.timeStopped.getDate() &&
            element[1].getMonth() === e.timeStopped.getMonth() &&
            element[1].getFullYear() === e.timeStopped.getFullYear()
          );
        })
      ) {
        temp[indexOfWidth][0] += e.timeInHours;
      } else {
        temp.push([Math.round(e.timeInHours * 100) / 100, e.timeStopped]);
      }
    });
    this.setChartData(temp);
    this.setChartLabel();
  }

  updateChart(): void {
    const container = document.getElementById('canvasContainer');
    const oldInstance = document.getElementById('overView');
    container.removeChild(oldInstance);
    const newInstance = document.createElement('canvas');
    newInstance.setAttribute('id', 'overView');
    newInstance.setAttribute('height', '40');
    container.appendChild(newInstance);
    this.chart = this.setChart();
    this.chart.data.labels = this.chartLabel;
    this.chart.data.datasets = this.setDataSetArray(this.chartData, '#3582ff');
    this.chart.update();
  }

  setChartData(temp: Array<any>): void {
    const array = new Array();
    const diff = Math.floor(
      (this.endDate.getTime() - this.startDate.getTime()) / 1000 / 60 / 60 / 24
    );
    for (let i = diff; i >= 0; i--) {
      const date2 = new Date(new Date().setHours(0, 0, 0, 0));
      date2.setDate(this.endDate.getDate() - i);
      if (temp.find(x => this.checkSameDate(x[1], date2))) {
        const el = temp.find(x => this.checkSameDate(x[1], date2));
        array.push(el[0]);
      } else {
        array.push(0);
      }
    }
    this.chartData = array;
  }

  setChartLabel() {
    const array = new Array();
    const temp = Math.floor(
      (this.endDate.getTime() - this.startDate.getTime()) / 1000 / 60 / 60 / 24
    );
    for (let i = 0; i <= temp; i++) {
      array.push([this.dateToDDMM(new Date(+this.startDate + i * 86400000))]);
    }
    this.chartLabel = array;
  }

  setDataSetArray(data: Array<number>, bgcolor: string): Array<DataSet> {
    const array = new Array();
    const max = Math.max.apply(
      Math,
      data.map(function(o) {
        return o;
      })
    );
    const temp = new Array();
    data.forEach(e => {
      temp.push(e === 0 ? 0 : max - e);
    });
    array.push(
      { data: data, backgroundColor: bgcolor },
      { data: temp, backgroundColor: 'rgb(211, 211, 211, 0.7)' }
    );
    return array;
  }

  setDetailChart(idx: number) {
    let indexOfWidth: number;
    const temp = new Array();
    const date = new Date(+this.startDate + idx * 86400000);
    const array = this.periodArray.filter(function(element) {
      return (
        element.timeStopped.getDate() === date.getDate() &&
        element.timeStopped.getMonth() === date.getMonth() &&
        element.timeStopped.getFullYear() === date.getFullYear()
      );
    });
    array.forEach(e => {
      if (
        temp.find(function(element, index) {
          indexOfWidth = index;
          return e.project !== null
            ? element[0] === e.project.name
            : element[0] === 'No project assigned';
        })
      ) {
        temp[indexOfWidth][1] += e.timeInHours;
        if (e.billable) {
          temp[indexOfWidth][3] += e.timeInHours;
        }
      } else {
        temp.push([
          e.project !== null ? e.project.name : 'No project assigned',
          e.timeInHours,
          e.project !== null ? e.project.color : '#585a5e',
          e.billable ? e.timeInHours : 0,
          e.timeInHours,
          e.billable ? e.timeInHours : 0
        ]);
      }
    });
    this.setDetailChartDatas(temp);
  }

  setDetailChartDatas(array: Array<any>) {
    this.detailChartBgColor.splice(0, this.detailChartBgColor.length);
    this.detailChartData.splice(0, this.detailChartData.length);
    this.detailChartLabel.splice(0, this.detailChartLabel.length);
    array.forEach(e => {
      this.detailChartData.push(Math.round(e[1] * 100) / 100);
      this.detailChartBgColor.push(e[2]);
      this.detailChartLabel.push(e[0]);
    });
    this.isVisible = true;
  }

  setChart() {
    return new Chart('overView', {
      type: 'bar',
      data: {
        labels: this.chartLabel,
        datasets: [
          {
            data: this.chartData,
            backgroundColor: '#3582ff'
          },
          {
            data: [],
            backgroundColor: 'rgb(211, 211, 211, 0.7)'
          }
        ]
      },
      options: {
        scales: {
          xAxes: [{ stacked: true }],
          yAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true
              }
            }
          ]
        },
        responsive: true,
        onClick: this.barClick.bind(this),
        onResize: function(chart) {
          chart.update();
        },
        tooltips: {
          displayColors: false,
          enabled: true,
          mode: 'single',
          callbacks: {
            label: function(tooltipItems, data) {
              let h, m;
              const temp = Number(data.datasets[0].data[tooltipItems.index]);
              Math.floor(temp) < 10
                ? (h = '0' + Math.floor(temp))
                : (h = '' + Math.floor(temp));
              (temp % 1) * 60 < 10
                ? (m = '0' + Math.round((temp % 1) * 60))
                : (m = '' + Math.round((temp % 1) * 60));
              const sum = h + ':' + m;
              return 'You worked ' + sum + ' h';
            }
          }
        }
      }
    });
  }

  setPieChart() {
    this.pieChart = new Chart('canvas2', {
      type: 'doughnut',
      data: {
        labels: this.detailChartLabel,
        datasets: [
          {
            // label: 'Reports from ' + this.dateToDDMM(this.today),
            data: this.detailChartData,
            backgroundColor: this.detailChartBgColor
          }
        ]
      },
      options: {
        cutoutPercentage: 30,
        scales: {
          xAxes: [
            {
              display: false
            }
          ],
          yAxes: [
            {
              display: false,
              ticks: {
                beginAtZero: true
              }
            }
          ]
        },
        legend: {
          display: false
        },
        tooltips: {
          mode: 'label',
          callbacks: {
            label: function(tooltipItem, data) {
              const indice = tooltipItem.index;
              let h, m;
              const temp = Number(data.datasets[0].data[indice]);
              Math.floor(temp) < 10
                ? (h = '0' + Math.floor(temp))
                : (h = '' + Math.floor(temp));
              (temp % 1) * 60 < 10
                ? (m = '0' + Math.round((temp % 1) * 60))
                : (m = '' + Math.round((temp % 1) * 60));
              const sum = h + ':' + m;
              return 'You worked ' + sum + ' h (' + data.labels[indice] + ')';
            }
          }
        },
        responsive: true,
        aspectRatio: 3
      }
    });
  }

  getRequiredTime(temp: number): string {
    let h, m;
    Math.floor(temp) < 10
      ? (h = '0' + Math.floor(temp))
      : (h = '' + Math.floor(temp));
    (temp % 1) * 60 < 10
      ? (m = '0' + Math.round((temp % 1) * 60))
      : (m = '' + Math.round((temp % 1) * 60));
    return h + ':' + m;
  }
}
