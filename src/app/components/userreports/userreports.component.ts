declare var require: any;
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { UserService } from '../../services/user/user.service';
import { HostListener } from '@angular/core';
// import { pixelWidth } from 'string-pixel-width';

@Component({
  selector: 'app-userreports',
  templateUrl: './userreports.component.html',
  styleUrls: ['./userreports.component.scss']
})
@HostListener('window:resize', ['$event'])
export class UserReportsComponent implements OnInit, AfterViewInit {
  tdArray = [[], [], []];
  projectData = []; // data for project names
  selected = 'day'; // day week month selection for user
  periodArray = [[], [], []]; // final data array for every use in component
  width = []; // width for the stripe chart sequences
  tempWidth;
  tempArray;
  widthHelp = [];
  actualSelect = 0;
  dwmArray = new Array(); // array for order of elements in periodArray
  periodArrayOB; // periodArray only billable
  ob = false;
  hoverBubbleRight = 0;
  hoverTemp = new Array();
  bilCheck = false;
  pixelWidth;
  screenHeight;
  screenWidth;

  constructor(
    private dataService: DataService,
    private userService: UserService
  ) {
    this.onResize();
  }
  onResize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  ngOnInit() {
    this.pixelWidth = require('string-pixel-width');
    this.tdArray = [[], [], []];
    this.widthHelp = [];
    this.periodArray = [[], [], []]; // final data array for every use in component
    this.dataService
      .getTimeLogs(this.userService.getUser().id)
      .subscribe(res => {
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
        // some settings for new shown period
        for (let j = 0; j < 3; j++) {
          for (let x = 0; x < this.periodArray[j].length; x++) {
            this.tdArray[j][x] = x;
          }
        }
        this.width = []; // width for the stripe chart sequences
        this.setWidth();
      });
  }
  ngAfterViewInit() {
    if (this.ob) {
      this.ob = false;
      this.periodArray = this.periodArrayOB;
    }
    this.setWidth();
    for (let x = 0; x < this.width.length; x++) {
      this.tdArray[this.actualSelect][x] = x;
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
  // change period for stripe chart view
  selectedOption() {
    if (this.bilCheck) {
      for (let i = 0; i < this.periodArray[this.actualSelect].length; i++) {
        if (this.periodArray[this.actualSelect][i].length === 4) {
          this.periodArray[this.actualSelect][i][2] += this.periodArray[
            this.actualSelect
          ][i][3];
        }
      }
      this.bilCheck = false;
    }
    if (this.selected === 'day') {
      this.actualSelect = 0;
    } else if (this.selected === 'week') {
      this.actualSelect = 1;
    } else if (this.selected === 'month') {
      this.actualSelect = 2;
    }
    this.ngAfterViewInit();
  }
  // checks if there are existing project for this period
  projectExists() {
    if (this.periodArray[this.actualSelect].length === 0) {
      return false;
    } else {
      return true;
    }
  }
  // checking if issue is in the acutal month
  workInSameMonth(date1: Date, date2: Date) {
    return (
      (date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()) ||
      (new Date(+new Date() + 86400000).getDate() > new Date().getDate() &&
        new Date(+new Date() - 86400000).getDate() < new Date().getDate())
    );
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
  // set array for stripe chart project percentages
  setWidth() {
    this.widthHelp = [];
    this.width = [];
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
      let temp = 0;
      for (let i = 0; i < this.widthHelp.length; i++) {
        temp += this.widthHelp[i];
      }
      for (let i = 0; i < this.widthHelp.length; i++) {
        this.width[i] = Math.round((this.widthHelp[i] / temp) * 100);
      }
    }
  }
  // called from html component in ngFor loop
  getWidth(i) {
    return this.width[i] + '%';
  }
  // called from html component in ngFor loop
  getColor(i) {
    if (this.periodArray[this.actualSelect].length === 0) {
      return '#35383d';
    } else {
      if (this.bilCheck) {
        let count = i;
        while (this.periodArray[this.actualSelect][count][2] === 0) {
          count++;
        }
        return this.periodArray[this.actualSelect][count][1];
      }
      return this.periodArray[this.actualSelect][i][1];
    }
  }
  // get name of Project
  getProjectData(i, bool) {
    let pixelTemp = this.screenWidth - 20;
    pixelTemp = pixelTemp * (this.width[i] / 100);
    if (this.periodArray[this.actualSelect][i][0] == null) {
      return 'No project assigned';
    } else {
      if (this.bilCheck) {
        let count = i;
        while (this.periodArray[this.actualSelect][count][2] === 0) {
          count++;
        }
        if (
          this.pixelWidth(this.periodArray[this.actualSelect][count][0], {
            size: 14
          }) <= pixelTemp ||
          bool
        ) {
          return this.periodArray[this.actualSelect][count][0];
        } else {
          return this.periodArray[this.actualSelect][count][0].charAt(0);
        }
      }
    }
    if (
      this.pixelWidth(this.periodArray[this.actualSelect][i][0], {
        size: 14
      }) <= pixelTemp ||
      bool
    ) {
      return this.periodArray[this.actualSelect][i][0];
    } else {
      return this.periodArray[this.actualSelect][i][0].charAt(0);
    }
  }
  // get duration of project work
  getRequiredTime(i) {
    let h, m;
    const temp = this.periodArray[this.actualSelect][i][2];
    if (temp < 0.017) {
      return '00:01';
    }
    if (Math.floor(temp) < 10) {
      h = '0' + Math.floor(temp);
    } else {
      h = '' + Math.floor(temp);
    }
    if ((temp % 1) * 60 < 10) {
      m = '0' + Math.round((temp % 1) * 60);
    } else {
      m = '' + Math.round((temp % 1) * 60);
    }
    return h + ':' + m;
  }
  // get get percential width of project for stripe chart
  getPercentage(i) {
    if (this.periodArray[this.actualSelect].length === 0) {
      return 0;
    } else {
      return this.getWidth(i);
    }
  }
  // get percentage of billable/non billable of a project
  getBillPercent(i) {
    if (this.periodArray[this.actualSelect][i].length < 4) {
      return '100 % billable';
    } else {
      const temp =
        this.periodArray[this.actualSelect][i][2] +
        this.periodArray[this.actualSelect][i][3];
      return (
        Math.round((this.periodArray[this.actualSelect][i][2] / temp) * 100) +
        '% billable' +
        ', ' +
        Math.round((this.periodArray[this.actualSelect][i][3] / temp) * 100) +
        '% non billable'
      );
    }
  }
  // get percential width of billable project issues for stripe chart
  checkBox(event) {
    if (event.checked) {
      this.bilCheck = true;
      for (let i = 0; i < this.periodArray[this.actualSelect].length; i++) {
        if (this.periodArray[this.actualSelect][i].length === 4) {
          this.periodArray[this.actualSelect][i][2] -= this.periodArray[
            this.actualSelect
          ][i][3];
        }
      }
    } else if (!event.checked) {
      this.bilCheck = false;
      for (let i = 0; i < this.periodArray[this.actualSelect].length; i++) {
        if (this.periodArray[this.actualSelect][i].length === 4) {
          this.periodArray[this.actualSelect][i][2] += this.periodArray[
            this.actualSelect
          ][i][3];
        }
      }
    }
    this.periodArrayOB = this.periodArray;
    this.ob = true;
    this.tdArray = [[], [], []];
    this.ngAfterViewInit();
  }
  // set positin of bubble arrow
  bubbleHover(a, i) {
    if (a === 1 && this.hoverTemp[i] > 82) {
      this.hoverBubbleRight = 1;
    } else if (a === 1 && this.hoverTemp[i] < 7) {
      this.hoverBubbleRight = 2;
    } else {
      this.hoverBubbleRight = 0;
    }
  }
  // get postion of detail bubble for suitale project
  bubblePos(a) {
    let counter = 0;
    for (let i = 0; i < a; i++) {
      counter += this.width[i];
    }
    const temp = this.width[a] / 2;
    let temp2 = counter + temp - 8 - a * 0.2;
    this.hoverTemp[a] = temp2;
    if (temp2 > 82) {
      temp2 = 82;
    }
    if (temp2 < 18) {
      temp2 = 18;
    }
    return temp2 + '%';
  }
}
