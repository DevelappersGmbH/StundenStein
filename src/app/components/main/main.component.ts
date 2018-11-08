import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { Issue } from 'src/app/model/issue.interface';
import { Project } from 'src/app/model/project.interface';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  projects: Project[];
  issues: Partial<Issue>[];
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getProjects().subscribe(p => {
      this.projects = p;
    });
    this.dataService.getIssues().subscribe(i => {
      this.issues = i;
    });
  }
}
