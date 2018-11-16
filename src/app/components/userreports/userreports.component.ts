import { Component, OnInit, OnChanges } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { UserService } from '../../services/user/user.service';
import { randomColor } from 'randomcolor';
import { StaticInjector } from '@angular/core/src/di/injector';

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

  constructor(private dataService: DataService, private userService: UserService) { }

  ngOnInit() {
    this.dataService.getTimeLogs(this.userService.getUser().id)
    .subscribe(res => {
      console.log('what: ' + res);
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
