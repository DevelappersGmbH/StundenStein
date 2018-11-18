import { Component, OnInit, OnChanges } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { UserService } from '../../services/user/user.service';
import { randomColor } from 'randomcolor';

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
  dwmArray = new Array();
  
  constructor(private dataService: DataService, private userService: UserService) { }

  ngOnInit() {
    console.log();
    let projectArray = [[],[],[]];
    this.dataService.getTimeLogs(this.userService.getUser().id)
    .subscribe(res => {
      console.log(res);
      let date = new Date();
      for (let i = 0; i < res.length; i++){
        if (new Date(res[i].timeStopped).getFullYear() == date.getFullYear()
        && new Date(res[i].timeStopped).getMonth() == date.getMonth()){
          if (this.dwmArray[i] == undefined){
            this.dwmArray[i] = [2];
          }
          else{
            this.dwmArray[i][this.dwmArray[i].length] = 2
          }
          if (new Date(res[i].timeStopped).getDate() == date.getDate()){
            if (this.dwmArray[i] == undefined){
              this.dwmArray[i] = [0];
            }
            else{
              this.dwmArray[i][this.dwmArray[i].length] = 0
            }
          }
        }
        if (this.getWeekNumber(new Date(res[i].timeStopped)) == this.getWeekNumber(date)){
          if (this.dwmArray[i] == undefined){
            this.dwmArray[i] = [1];
          }
          else{
            this.dwmArray[i][this.dwmArray[i].length] = 1
          }
        }
      }
      console.log(this.dwmArray);
      for (let i = 0; i < res.length; i++){
        for (let m = 0; m < this.dwmArray[i].length; m++)
            if (res[i].booked){
              let projEx = false;
              let projN = 0;
              if (projectArray != undefined){
                for (let n = 0; n < projectArray[this.dwmArray[i][m]].length; n++){
                  if (projectArray[this.dwmArray[i][m]][n][0] == res[i].issue.project.id){
                    projEx = true;
                    projN = n;
                  }
                }
              }
              if (projEx){
                if (this.workInSameMonth(new Date(res[i].timeStarted), new Date(res[i].timeStopped))){
                  console.log('b add normal' + i);
                  projectArray[this.dwmArray[i][m]][projN][projectArray[this.dwmArray[i][m]].length] = res[i].timeInHours;
                  console.log(projectArray);
                } 
                else{
                  console.log('b add unnormal' + i);
                  let date = new Date();
                  projectArray[this.dwmArray[i][m]][projN][projectArray[this.dwmArray[i][m]].length] = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
                  console.log(projectArray);
                } 
              }
              else{
                if (this.workInSameMonth(new Date(res[i].timeStarted), new Date(res[i].timeStopped))){
                  console.log('b create new normal ' + i);
                  projectArray[this.dwmArray[i][m]][projectArray[this.dwmArray[i][m]].length] = [res[i].issue.project.id, res[i].timeInHours];
                  console.log(projectArray);
                }
                else{
                  console.log('b create new unnormal' + i);
                  let date = new Date(res[i].timeStopped);
                  projectArray[this.dwmArray[i][m]][projectArray[this.dwmArray[i][m]].length] = [res[i].issue.project.id, date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600];
                  console.log(projectArray);
                }
              }
            }
            else{
              let projEx = false;
              let projN = 0;
              if (projectArray != undefined){
                for (let n = 0; n < projectArray[this.dwmArray[i][m]].length; n++){
                  if (projectArray[this.dwmArray[i][m]][n][0] == null){
                    projEx = true;
                    projN = n;
                  }
                }
              }
              if (projEx){
                if (this.workInSameMonth(new Date(res[i].timeStarted), new Date(res[i].timeStopped))){
                  console.log('add normal' + i);
                  projectArray[this.dwmArray[i][m]][projN][projectArray[this.dwmArray[i][m]].length] = res[i].timeInHours;
                  console.log(projectArray);
                } 
                else{
                  console.log('add unnormal' + i);
                  projectArray[this.dwmArray[i][m]][projN][projectArray[this.dwmArray[i][m]].length] = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
                  console.log(projectArray);
                } 
              }
              else{
                if (this.workInSameMonth(new Date(res[i].timeStarted), new Date(res[i].timeStopped))){
                  console.log('create new normal ' + i);
                  console.log(res[i].timeInHours);
                  projectArray[this.dwmArray[i][m]][projectArray[this.dwmArray[i][m]].length] = [null, res[i].timeInHours];
                  console.log(projectArray);
                }
                else{
                  console.log('create new unnormal' + i);
                  let date = new Date(res[i].timeStopped);
                  projectArray[this.dwmArray[i][m]][projectArray[this.dwmArray[i][m]].length] = [null, date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600];
                  console.log(projectArray);
                }
              }
            }
      }
      console.log(projectArray);
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

  workInSameMonth(date1: Date, date2: Date){
    return (date1.getDate() == date2.getDate()
    && date1.getMonth() == date2.getMonth()
    && date1.getFullYear() == date2.getFullYear())
    || (new Date(+new Date() + 86400000).getDate() > new Date().getDate()
    && new Date(+new Date() - 86400000).getDate() < new Date().getDate());
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
