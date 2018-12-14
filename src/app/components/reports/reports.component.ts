import {
  Component,
  OnInit,
  AfterViewInit,
  AfterViewChecked,
  AfterContentChecked
} from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { Chart } from 'chart.js';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';
import { ErrorService } from 'src/app/services/error/error.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent
  implements OnInit, AfterViewInit, AfterViewChecked, AfterContentChecked {
  tab = 'day';
  chart = [];
  chart2 = [];
  chart3 = [];
  chartData = [1, 2, 3, 4, 5, 6];
  periodArray = [[], [], []];
  dwmArray = new Array();
  widthHelp = [];
  actualSelect = 0;

  constructor(
    private dataService: DataService,
    private userService: UserService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.periodArray = [[], [], []]; // final data array for every use in component
    this.dataService
      .getTimeLogs(this.userService.getUser().id)
      .subscribe(res => {
        if (res === undefined) {
          this.errorService.errorDialog(
            'Did not recieved data from the dataService, wich distributes the project data.'
          );
        }
        // fill dmwArray
        const date = new Date();
        this.dwmArray = [];
        for (let i = 0; i < res.length; i++) {
          // month sequence
          if (
            new Date(res[i].timeStopped).getFullYear() === date.getFullYear() &&
            new Date(res[i].timeStopped).getMonth() === date.getMonth()
          ) {
            if (this.dwmArray[i] === undefined) {
              this.dwmArray[i] = [2];
            } else {
              this.dwmArray[i][this.dwmArray[i].length] = 2;
            }
            // day sequence
            if (new Date(res[i].timeStopped).getDate() === date.getDate()) {
              if (this.dwmArray[i] === undefined) {
                this.dwmArray[i] = [0];
              } else {
                this.dwmArray[i][this.dwmArray[i].length] = 0;
              }
            }
          }
          // week sequence
          if (
            this.getWeekNumber(new Date(res[i].timeStopped)) ===
            this.getWeekNumber(date)
          ) {
            if (this.dwmArray[i] === undefined) {
              this.dwmArray[i] = [1];
            } else {
              this.dwmArray[i][this.dwmArray[i].length] = 1;
            }
          }
          if (this.dwmArray[i] === undefined) {
            this.dwmArray[i] = [];
          }
        }
        // fill periodArray
        for (let i = 0; i < res.length; i++) {
          for (let m = 0; m < this.dwmArray[i].length; m++) {
            let projEx = false;
            let projN = 0;
            // check if project already exists for the period
            if (this.periodArray !== undefined) {
              for (
                let n = 0;
                n < this.periodArray[this.dwmArray[i][m]].length;
                n++
              ) {
                if (res[i].booked && res[i].project !== undefined) {
                  if (
                    this.periodArray[this.dwmArray[i][m]][n][0] ===
                    res[i].project.name
                  ) {
                    projEx = true;
                    projN = n;
                  }
                } else {
                  if (this.periodArray[this.dwmArray[i][m]][n][0] == null) {
                    projEx = true;
                    projN = n;
                  }
                }
              }
            }
            let timeInHoursMod;
            if (this.dwmArray[i][m] === 0) {
              timeInHoursMod = this.checkSameDay(
                res[i].timeStarted,
                res[i].timeStopped,
                res[i].timeInHours
              );
            } else if (this.dwmArray[i][m] === 1) {
              timeInHoursMod = this.checkSameWeek(
                res[i].timeStarted,
                res[i].timeStopped,
                res[i].timeInHours
              );
            } else if (this.dwmArray[i][m] === 2) {
              timeInHoursMod = this.checkSameMonth(
                res[i].timeStarted,
                res[i].timeStopped,
                res[i].timeInHours
              );
            }
            // add to suitable period and project
            if (projEx) {
              this.periodArray[this.dwmArray[i][m]][projN][2] += timeInHoursMod;
              if (!res[i].billable) {
                if (this.periodArray[this.dwmArray[i][m]][projN].length === 4) {
                  this.periodArray[this.dwmArray[i][m]][
                    projN
                  ][3] += timeInHoursMod;
                } else {
                  this.periodArray[this.dwmArray[i][m]][
                    projN
                  ][3] = timeInHoursMod;
                }
              }
            } else {
              // create new project in suitable period
              if (res[i].booked) {
                this.periodArray[this.dwmArray[i][m]][
                  this.periodArray[this.dwmArray[i][m]].length
                ] = [res[i].project.name, res[i].project.color, timeInHoursMod];
              } else {
                this.periodArray[this.dwmArray[i][m]][
                  this.periodArray[this.dwmArray[i][m]].length
                ] = [null, '#585a5e', timeInHoursMod];
              }
              if (!res[i].billable) {
                if (
                  this.periodArray[this.dwmArray[i][m]][
                    this.periodArray[this.dwmArray[i][m]].length - 1
                  ].length === 4
                ) {
                  this.periodArray[this.dwmArray[i][m]][
                    this.periodArray[this.dwmArray[i][m]].length - 1
                  ][3] += timeInHoursMod;
                }
                this.periodArray[this.dwmArray[i][m]][
                  this.periodArray[this.dwmArray[i][m]].length - 1
                ][3] = timeInHoursMod;
              }
            }
          }
        }
      });
  }

  ngAfterViewInit() {
    this.setWidth();
    console.log(this.widthHelp);
    if (this.tab === 'day') {
    } else if (this.tab === 'week') {
      this.chart2 = new Chart('canvas2', {
        type: 'bar',
        data: {
          labels: ['Red', 'Blue'],
          datasets: [
            {
              data: this.widthHelp,
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
    } else if (this.tab === 'month') {
      this.chart3 = new Chart('canvas3', {
        type: 'bar',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [
            {
              data: this.widthHelp,
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
    this.chart = new Chart('canvas', {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue'],
        datasets: [
          {
            data: this.widthHelp,
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

  ngAfterViewChecked() {}

  ngAfterContentChecked() {}

  setWidth() {
    this.widthHelp = [];
    if (this.periodArray[this.actualSelect].length === 0) {
      this.widthHelp[0] = 0;
    } else {
      for (let i = 0; i < this.periodArray[this.actualSelect].length; i++) {
        this.widthHelp[i] = this.periodArray[this.actualSelect][i][2];
      }
      const currentNewWidthHelp = [];
      this.widthHelp.forEach(entry => {
        if (entry !== 0) {
          currentNewWidthHelp.push(entry);
        }
      });
      this.widthHelp = currentNewWidthHelp;
    }
  }
  // checks if timelog is started and stopped at the same day
  checkSameDay(start: Date, stop: Date, time: number) {
    if (
      start.getDate() === stop.getDate() &&
      start.getMonth() === stop.getMonth() &&
      start.getFullYear() === stop.getFullYear()
    ) {
      return time;
    } else {
      return stop.getHours() + ((stop.getMinutes() / 3) * 5) / 100;
    }
  }
  // checks if timelog is started and stopped at the same week
  checkSameWeek(start: Date, stop: Date, time: number) {
    if (this.getWeekNumber(start) === this.getWeekNumber(stop)) {
      return time;
    } else {
      let temp = 0;
      let stop0 = stop.getDay();
      if (stop.getDay() === 0) {
        stop0 = 7;
      }
      for (let i = 1; i < stop0; i++) {
        temp += 24;
      }
      return temp + stop.getHours() + ((stop.getMinutes() / 3) * 5) / 100;
    }
  }
  // checks if timelog is started and stopped in the same month
  checkSameMonth(start: Date, stop: Date, time: number) {
    if (start.getMonth() === stop.getMonth()) {
      return time;
    } else {
      let temp = 0;
      for (let i = 1; i < stop.getDate() + 1; i++) {
        temp += 24;
      }
      return temp + stop.getHours() + ((stop.getMinutes() / 3) * 5) / 100;
    }
  }
  // get week number
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

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    if (tabChangeEvent.index === 0) {
      this.tab = 'day';
      this.actualSelect = 0;
    } else if (tabChangeEvent.index === 1) {
      this.tab = 'week';
      this.actualSelect = 1;
    } else {
      this.tab = 'month';
      this.actualSelect = 2;
    }
    this.ngAfterViewInit();
  }
}
