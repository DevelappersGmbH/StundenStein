import { Component, OnInit, OnChanges } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { UserService } from '../../services/user/user.service';
import { randomColor } from 'randomcolor';
import { StaticInjector } from '@angular/core/src/di/injector';
import { formatDate } from '@angular/common';
import { toDate } from '@angular/common/src/i18n/format_date';

@Component({
  selector: 'app-userreports',
  templateUrl: './userreports.component.html',
  styleUrls: ['./userreports.component.scss']
})
export class UserreportsComponent implements OnInit {

  array = [2, 3, 5, 2, 1];
  width: number[];
  color = [];
  projectData = [];
  selected = 'day';
  colorHue = ['green', 'blue', 'red', 'orange', 'purple', 'pink'];
  periodArray = [[]];
  projectIndex = 0;

  constructor(private dataService: DataService, private userService: UserService) { }

  ngOnInit() {
    this.dataService.getTimeLogs(this.userService.getUser().id)
    .subscribe(res => {
      console.log(res);
      let date = new Date();
      let projectArray = [[]];
      let subFrom = 8;
      let subTo = 10;
      let dmy = 3;
        for (let i = 0; i < res.length; i++){
          if (res[i].timeStarted.substring(0,4) == date.getFullYear().toString()){
            if (res[i].timeStarted.substring(5,7) == (date.getMonth() + 1).toString()){
            dmy = 2;
            if (res[i].timeStarted.substring(8,10) == date.getDate().toString()){
              dmy = 0;
            }
          }
          }
          let date2 = new Date(res[i].timeStarted);
          if (this.getWeekNumber(date2) == this.getWeekNumber(date)){
            dmy = 1;
          }
            if (res[i].booked == false){
              let projEx = false
              let indexJ = 0;
              for (let j = 0; j < projectArray.length; j++){
                if (projectArray[j][0] == null){
                  projEx = true;
                  indexJ = j;
                }
              }
              if (projEx){
                projectArray[indexJ][projectArray[indexJ].length] = [dmy, res[i].timeInHours];
                this.projectIndex = indexJ;
              }
              else{
                projectArray[i] = [null, [dmy, res[i].timeInHours]];
                this.projectIndex = i;
              }
            }
            else if (res[i].booked){
              let projEx = false
              let indexJ = 0;
              for (let j = 0; j < projectArray.length; j++){
                if (projectArray[j][0] == res[i].issue.project.id){
                  projEx = true;
                  indexJ = j;
                }
              }
              if (projEx){
                projectArray[indexJ][projectArray[indexJ].length] = [dmy, res[i].timeInHours];
                this.projectIndex = indexJ;
              }
              else{
                projectArray[i] = [res[i].issue.project.id, [dmy, res[i].timeInHours];
                this.projectIndex = i;
              }
            }
            if (dmy < 3){
              this.periodArray[dmy] = projectArray[this.projectIndex];
            }
        }
        console.log(projectArray);
        console.log(this.periodArray);
    })
    this.dataService.getProjects().subscribe(p => {
      this.projectData = p;
      for (let i in this.projectData){
        this.projectData[i] = p[i].name;
      }
      //set array for stripe chart color
      let tempRand = 8;
      let rand = 0;
      for(let i in p){
        while (rand == tempRand){
          rand = Math.floor(Math.random() * 5);
        }
        this.color[i] = randomColor({luminosity: 'dark', hue: this.colorHue[rand]});
        tempRand = rand
      }
    })
  }

  getWeekNumber(d: Date): number {
    d = new Date(+d);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    var yearStart = new Date(d.getFullYear(), 0, 1);
    var weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
    return weekNo;
}

  getWidth(i){
    //set array for stripe chart percentages
    this.width = this.array;
    let temp = 0
      
    for (let i in this.array){
      temp = temp + this.array[i]
    }
    for (let i in this.array){
      this.width[i] = Math.round((this.width[i] / temp) * 100);
    }
    return this.width[i]+'%';
  }

  getColor(i){
    return this.color[i];
  }

  selectedOption(){
    if (this.selected == "day"){
      this.array = [5, 10, 7 ,2, 8];
    }
    else if (this.selected == "week"){
      this.array = [1, 2, 3, 4, 5];
    }
    else if (this.selected == "month"){
      this.array = [5, 4, 3, 2, 1];
    }
    this.ngOnInit();
  }
  getProjectData(i){
    return this.projectData[i];
  }
  checkBox(event){
    if (event.checked == true){
      console.log('only billable shown');
    }
    else if (event.checked == false){
      console.log('all shown');
    }
  }
  bubblePos(a){
    let counter = 0;
    for (let i = 0; i < a; i++){
      counter += this.width[i];
    }
    let temp = this.width[a] / 2;
    let temp2 = (counter + temp) - 5 - a*0.6;
    if (temp2 > 87){
      temp2 = 87;
    }
    return temp2+'%';
  }
}
