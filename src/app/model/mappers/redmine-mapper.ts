import { ColorService } from 'src/app/services/color/color.service';
import { Injectable } from '@angular/core';
import { Issue } from '../issue.interface';
import { Project } from '../project.interface';
import { RedmineIssue } from 'src/app/redmine-model/redmine-issue.interface';
import { RedmineProject } from 'src/app/redmine-model/redmine-project.interface';
import { RedmineTimeEntryActivities } from 'src/app/redmine-model/redmine-time-entry-activities.interface';
import { RedmineTimeEntryActivity } from 'src/app/redmine-model/redmine-time-entry-activity.interface';
import { User } from '../user.interface';
import { UserService } from 'src/app/services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class RedmineMapper {
  constructor(
    private colorService: ColorService,
    private userService: UserService
  ) {}

  mapRedmineProjectArrayToProjectArray(
    redmineProjects: RedmineProject[]
  ): Project[] {
    const projects: Project[] = [];
    redmineProjects.forEach(project => {
      projects.push(this.mapRedmineProjectToProject(project));
    });
    return projects;
  }

  mapRedmineProjectToProject(redmineProject: RedmineProject): Project {
    return {
      id: redmineProject.id,
      name: redmineProject.name,
      color: this.colorService.getColor(redmineProject.identifier)
    };
  }

  mapRedmineIssueArrayToIssueArray(
    redmineIssues: RedmineIssue[],
    projects: Project[]
  ): Issue[] {
    const issues = [];
    redmineIssues.forEach(redmineIssue => {
      const issue: Issue = {
        id: redmineIssue.id,
        subject: redmineIssue.subject,
        assignedTo: null,
        project: null,
        tracker: null
      };
      if (redmineIssue.assigned_to) {
        issue.assignedTo = redmineIssue.assigned_to;
      }
      if (redmineIssue.tracker) {
        issue.tracker = redmineIssue.tracker.name;
      }
      if (redmineIssue.project) {
        issue.project = projects.find(p => p.id === redmineIssue.project.id);
      }
      issues.push(issue);
    });
    return issues;
  }

  mapRedmineUserIdToCurrentUserOrNull(userId: number): User {
    return userId === this.userService.getUser().id
      ? this.userService.getUser()
      : null;
  }

  mapBillableToRedmineTimeEntryActivityId(
    value: boolean,
    redmineTimeEntryActivities: RedmineTimeEntryActivities
  ): number {
    return value
      ? redmineTimeEntryActivities.time_entry_activities.find(
          entry => entry.name === 'Billable'
        ).id
      : redmineTimeEntryActivities.time_entry_activities.find(
          entry => entry.name === 'Non billable'
        ).id;
  }

  mapRedmineTimeEntryActivityToBillable(
    id: number,
    redmineTimeEntryActivities: RedmineTimeEntryActivities
  ): boolean {
    const activity: RedmineTimeEntryActivity = redmineTimeEntryActivities.time_entry_activities.find(
      a => a.id === id
    );
    if (!activity) {
      return false;
    }
    return activity.name === 'Billable';
  }
}
