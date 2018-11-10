import { RedmineProject } from './redmine-project.interface';

export interface RedmineProjects {
  projects: RedmineProject[];
  total_count: number;
  offset: number;
  limit: number;
}
