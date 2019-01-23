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
  isVisible = true;
  bilCheck = false;
  selected = 'Select a period';
  projects = new FormControl();
  projectList: Array<string>;
  generalArray = new Array();
  projectSelection: Array<string>;
  pixelWidth;

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
    this.setProjectList();
    this.setOverView(this.periodArray);
    this.updateChart();
    this.setDetailChart();
    this.setPieChart();
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
    this.resetFilter();
    const startDateBackup = this.startDate;
    const endDateBackup = this.endDate;
    bool ? (this.startDate = event.value._d) : (this.endDate = event.value._d);
    this.dateInputValidation(startDateBackup, endDateBackup);
    this.ngOnInit();
  }

  barClick(event, array) {}

  dateInputValidation(startDateBackup, endDateBackup) {
    if (this.startDate.getTime() > this.endDate.getTime()) {
      this.startDate = startDateBackup;
      this.endDate = endDateBackup;
      this.date = new FormControl(moment(this.endDate));
      this.dateInit = new FormControl(moment(this.startDate));
      this.errorService.errorDialog(
        'End date has to be higher than start date.'
      );
    }
  }

  checkBox(event) {
    event.checked ? (this.bilCheck = true) : (this.bilCheck = false);
    this.ngOnInit();
  }

  selectedOption() {
    this.resetFilter();
    const startDateBackup = this.startDate;
    const endDateBackup = this.endDate;
    switch (this.selected) {
      case '0': {
        this.timeLogs.filter(x => this.checkWeek(x));
        this.startDate = this.getMonday(this.today);
        this.endDate = this.today;
        break;
      }
      case '1': {
        this.timeLogs.filter(x => this.checkLastWeek(x));
        this.startDate = this.getMonday(this.today);
        this.startDate = new Date(this.startDate.getTime() - 7 * 86400000);
        this.endDate = new Date(this.getMonday(this.today).getTime() - 1 * 86400000);
        break;
      }
      case '2': {
        this.timeLogs.filter(x => this.checkMonth(x));
        this.startDate = new Date(
          this.today.getFullYear(),
          this.today.getMonth(),
          1
        );
        this.endDate = new Date(
          this.today.getFullYear(),
          this.today.getMonth() + 1,
          0
        );
        break;
      }
      case '3': {
        this.timeLogs.filter(x => this.checkLastMonth(x));
        this.startDate = new Date(
          this.today.getFullYear(),
          this.today.getMonth(),
          1
        );
        this.startDate.setMonth(this.startDate.getMonth() - 1);
        this.endDate = new Date(
          this.today.getFullYear(),
          this.today.getMonth() + 1,
          0
        );
        this.endDate.setMonth(this.endDate.getMonth() - 1);
        break;
      }
    }
    this.dateInit = new FormControl(moment(this.startDate));
    this.date = new FormControl(moment(this.endDate));
    this.dateInputValidation(startDateBackup, endDateBackup);
    this.ngOnInit();
  }

  resetFilter() {
    this.projects.reset();
    this.bilCheck = false;
  }

  getMonday(d) {
    d = new Date(d);
    const day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  checkWeek(value: TimeLog) {
    return (
      this.getWeekNumber(value.timeStopped) ===
        this.getWeekNumber(this.today) &&
      this.today.getFullYear() === value.timeStopped.getFullYear()
    );
  }

  checkLastWeek(value: TimeLog) {
    return (
      this.getWeekNumber(value.timeStopped) ===
        this.getWeekNumber(
          new Date(new Date().setDate(this.today.getDate() - 7))
        ) &&
      this.today.getFullYear() -
        (this.getWeekNumber(this.today) === 1 ? 1 : 0) ===
        value.timeStopped.getFullYear()
    );
  }

  checkMonth(value: TimeLog) {
    return (
      this.today.getMonth() === value.timeStopped.getMonth() &&
      this.today.getFullYear() === value.timeStopped.getFullYear()
    );
  }

  checkLastMonth(value: TimeLog) {
    return this.today.getMonth() === 0
      ? value.timeStopped.getMonth() === 11 &&
          this.today.getFullYear() - 1 === value.timeStopped.getFullYear()
      : this.today.getMonth() - 1 === value.timeStopped.getMonth() &&
          this.today.getFullYear() === value.timeStopped.getFullYear();
  }

  getWeekNumber(d: Date): number {
    d = new Date(+d);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7);
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
      const name = e.project !== null ? e.project.name : 'No project assigned';
      const bool =
        this.projectSelection !== undefined
          ? this.projectSelection.length === 0
            ? true
            : this.projectSelection.includes(name)
          : true;
      if (bool && (this.bilCheck ? e.billable : true)) {
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
      }
    });
    this.setChartData(temp);
    this.setChartLabel();
  }

  getTotalTime(bool: boolean): string {
    let temp = 0;
    this.periodArray.forEach(e => {
      bool ? (temp += e.timeInHours) : (temp += e.billable ? e.timeInHours : 0);
    });
    return this.getRequiredTime(temp);
  }

  setProjectList() {
    const array = new Array();
    this.periodArray.forEach(e => {
      const name = e.project !== null ? e.project.name : 'No project assigned';
      if (!array.includes(name)) {
        array.push(name);
      }
    });
    this.projectList = array;
  }

  selectedProject() {
    this.ngOnInit();
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
      const date2 = new Date(this.endDate.getTime() - i * 86400000);
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
      { data: temp, backgroundColor: 'rgba(53, 130, 255, 0.1)' }
    );
    return array;
  }

  setDetailChart() {
    let indexOfWidth: number;
    const temp = new Array();
    this.periodArray.forEach(e => {
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
    this.generalArray = temp;
    this.setDetailChartDatas(temp);
  }

  setDetailChartDatas(array: Array<any>) {
    this.detailChartBgColor.splice(0, this.detailChartBgColor.length);
    this.detailChartData.splice(0, this.detailChartData.length);
    this.detailChartLabel.splice(0, this.detailChartLabel.length);
    array.forEach(e => {
      this.detailChartData.push(Math.round(e[this.bilCheck ? 3 : 1] * 100) / 100);
      this.detailChartBgColor.push(e[2]);
      this.detailChartLabel.push(e[0]);
    });
  }

  detailChartVisible() {
    return this.periodArray.length > 0
      ? this.bilCheck
        ? !this.periodArray.every(this.includesNonBillable)
        : true
      : true;
  }

  includesNonBillable(element) {
    return !element.billable;
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
            backgroundColor: 'rgba(53, 130, 255, 0.1)'
          }
        ]
      },
      options: {
        scales: {
          xAxes: [
            {
              stacked: true,
              scaleLabel: {
                display: true,
                labelString: 'days in dd.mm. format'
              }
            }
          ],
          yAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true
              },
              scaleLabel: {
                display: true,
                labelString: 'time in hours'
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
