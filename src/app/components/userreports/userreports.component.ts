import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-userreports',
  templateUrl: './userreports.component.html',
  styleUrls: ['./userreports.component.scss']
})
export class UserReportsComponent implements OnInit {
  tdArray = [];
  firstVisit = true;
  projectExists = true;
  array = [2, 3, 5, 2, 1]; // fake data for testing
  color = []; // color for the stripe chart sequences from randomcolor
  realColor = []; //color for the stripe chart sequences from data
  projectData = []; //data for project names
  selected = 'day'; //day week month selection for user
  colorHue = ['green', 'blue', 'red', 'orange', 'purple', 'pink'];
  periodArray = [[],[],[]]; //final data array for every use in component
  width = [[],[],[]]; //width for the stripe chart sequences
  tempWidth;
  tempArray;
  width2 = [[],[],[]];
  actualSelect = 0;
  dwmArray = new Array(); //array for order of elements in periodArray
  
  constructor(private dataService: DataService, private userService: UserService) { }

  ngOnInit() {
    this.tdArray = [];
    this.width2 = [[],[],[]];
    this.periodArray = [[],[],[]]; //final data array for every use in component
    this.dataService.getTimeLogs(this.userService.getUser().id)
    .subscribe(res => {
      console.log(res);
      //fill dmwArray
      let date = new Date();
      this.dwmArray = [];
      for (let i = 0; i < res.length; i++){
        //month sequence
        if (new Date(res[i].timeStopped).getFullYear() == date.getFullYear()
        && new Date(res[i].timeStopped).getMonth() == date.getMonth()){
          if (this.dwmArray[i] == undefined){
            this.dwmArray[i] = [2];
          }
          else{
            this.dwmArray[i][this.dwmArray[i].length] = 2
          }
          //day sequence
          if (new Date(res[i].timeStopped).getDate() == date.getDate()){
            if (this.dwmArray[i] == undefined){
              this.dwmArray[i] = [0];
            }
            else{
              this.dwmArray[i][this.dwmArray[i].length] = 0
            }
          }
        }
        //week sequence
        if (this.getWeekNumber(new Date(res[i].timeStopped)) == this.getWeekNumber(date)){
          if (this.dwmArray[i] == undefined){
            this.dwmArray[i] = [1];
          }
          else{
            this.dwmArray[i][this.dwmArray[i].length] = 1
          }
        }
      }
      //console.log('dwmArray');
      //console.log(this.dwmArray);

      //fill projectArray (for periodArray)
      for (let i = 0; i < res.length; i++){
        for (let m = 0; m < this.dwmArray[i].length; m++)
            //for booked projects (with names)
            if (res[i].booked){
              let projEx = false;
              let projN = 0;
              //check if project already exists for the period
              if (this.periodArray != undefined){
                for (let n = 0; n < this.periodArray[this.dwmArray[i][m]].length; n++){
                  if (this.periodArray[this.dwmArray[i][m]][n][0] == res[i].issue.project.name){
                    projEx = true;
                    projN = n;
                  }
                }
              }
              //add to suitable period and project
              if (projEx){
                  //console.log('add new project ' + i + ' dwm: ' + this.dwmArray[i][m]);
                  //console.log(res[i].timeInHours);
                  this.periodArray[this.dwmArray[i][m]][projN][2] += res[i].timeInHours;
              }
              //create new project in suitable period
              else{
                  //console.log('create new project ' + i + ' dwm: ' + this.dwmArray[i][m]);
                  //console.log(res[i].timeInHours);
                  this.periodArray[this.dwmArray[i][m]][this.periodArray[this.dwmArray[i][m]].length] = [res[i].issue.project.name, res[i].issue.project.color, res[i].timeInHours];
              }
            }
            //same as above for unbooked project (without name)
            else{
              let projEx = false;
              let projN = 0;
              if (this.periodArray != undefined){
                for (let n = 0; n < this.periodArray[this.dwmArray[i][m]].length; n++){
                  if (this.periodArray[this.dwmArray[i][m]][n][0] == null){
                    projEx = true;
                    projN = n;
                  }
                }
              }
              if (projEx){
                  //console.log('add (null) project' + i + ' dwm: ' + this.dwmArray[i][m]);
                  //console.log(res[i].timeInHours);
                  this.periodArray[this.dwmArray[i][m]][projN][2] += res[i].timeInHours;
              }
              else{
                  //console.log('create (null) project ' + i + ' dwm: ' + this.periodArray[this.dwmArray[i][m]].length);
                  //console.log(res[i].timeInHours);
                  this.periodArray[this.dwmArray[i][m]][this.periodArray[this.dwmArray[i][m]].length] = [null, '#35383d', res[i].timeInHours];
              }
            }
      }
      //console.log(this.periodArray);
      console.log('perioidArray erzeugt');
      if (this.selected == 'day'){
        this.actualSelect = 0;
      }
      else if (this.selected == 'week'){
        this.actualSelect = 1;
      }
      else if (this.selected == 'month'){
        this.actualSelect = 2;
      }
      for (let i = 0; i < this.periodArray[this.actualSelect].length; i++){
        this.tdArray[i] = i;
      }
      if (this.periodArray[this.actualSelect].length == 0){
        this.projectExists = false;
      }
      else{
        this.projectExists = true;
      }
      this.width = [[],[],[]]; //width for the stripe chart sequences
      this.setWidth(); 
    })
    //console.log('ngOnInit finished');
  }

  selectedOption(){
    if (this.selected == 'day'){
      this.ngOnInit();
    }
    else if (this.selected == 'week'){
      this.ngOnInit();
    }
    else if (this.selected == 'month'){
      this.ngOnInit();
    }
  }
  //checking if issue is in the acutal month
  workInSameMonth(date1: Date, date2: Date){
    return (date1.getDate() == date2.getDate()
    && date1.getMonth() == date2.getMonth()
    && date1.getFullYear() == date2.getFullYear())
    || (new Date(+new Date() + 86400000).getDate() > new Date().getDate()
    && new Date(+new Date() - 86400000).getDate() < new Date().getDate());
  }

  //get week number
  getWeekNumber(d: Date): number {
    d = new Date(+d);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    var yearStart = new Date(d.getFullYear(), 0, 1);
    var weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
    return weekNo;
}
  //set array for stripe chart project percentages
  setWidth(){
    for (let a = 0; a < 3; a++){
      if (this.periodArray[a].length == 0){
        this.width2[a][0] = 0;
      }
      else{
        for (let i = 0; i < this.periodArray[a].length; i++){
          this.width2[a][i] = this.periodArray[a][i][2];
        }
        let temp = 0;
        for (let i in this.width2[a]){
          temp = temp + this.width2[a][i]
        }
        for (let i in this.width2[a]){
          this.width[a][i] = Math.round((this.width2[a][i] / temp) * 100);
        }
      }
    }
  }
  //called from html component in ngFor loop
  getWidth(i){
    return this.width[this.actualSelect][i]+'%';
  }
  //called from html component in ngFor loop
  getColor(i){
    if (this.periodArray[this.actualSelect].length == 0){
      return '#35383d';
    }
    else{
      return this.periodArray[this.actualSelect][i][1];
    }
  }
  getProjectData(i){
    if (this.periodArray[this.actualSelect][i][0] == null){
      return 'No project assigned';
    }
    else{
      return this.periodArray[this.actualSelect][i][0];
    }
  }
  getRequiredTime(i){
    if (this.periodArray[this.actualSelect].length == 0){
      return 0;
    }
    else{
      let h, m, s;
      let temp = this.periodArray[this.actualSelect][i][2];
        if (Math.floor(temp) < 10){
          h = '0'+Math.floor(temp);
        }
        else{
          h = ''+Math.floor(temp);
        }
        if ((temp % 1) * 60 < 10){
          m = '0'+Math.floor((temp % 1) * 60);
        }
        else{
          m = ''+Math.floor((temp % 1) * 60);
        }
        if (((temp % 1) * 60) < 10){
          s = '0'+Math.floor((((temp % 1) * 60) % 1) * 60);
        }
        else{
          s = ''+Math.floor(((temp % 1) * 60) % 1 * 60);
        }
        return h+':'+m+':'+s; 
      }
    }

  getPercentage(i){
    if (this.periodArray[this.actualSelect].length == 0){
      return 0;
    }
    else{
      return this.getWidth(i);
    }
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
      counter += this.width[this.actualSelect][i];
    }
    let temp = this.width[this.actualSelect][a] / 2;
    let temp2 = (counter + temp) - 8 - a;
    if (temp2 > 87){
      temp2 = 87;
    }
    return temp2+'%';
  }
}
