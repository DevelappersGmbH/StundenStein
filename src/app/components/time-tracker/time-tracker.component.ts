import { Component, OnInit } from '@angular/core';
import { RedmineService } from 'src/app/services/redmine/redmine.service';
import { Project } from 'src/app/model/project.interface';

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss']
})
export class TimeTrackerComponent implements OnInit {

  constructor( private redmineService: RedmineService ) { }

  projects: Project[];

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.redmineService.getProjects().subscribe(data => {
      this.projects = data.projects;
    }, error => {
      console.error(error);
    });
  }

}
