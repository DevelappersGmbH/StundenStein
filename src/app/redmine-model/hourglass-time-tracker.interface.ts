import { RedmineProject } from './redmine-project.interface';

export interface HourGlassTimeTracker {
  id: number;
  created_at?: string;
  updated_at?: string;
  user_id: number;
  start: string;
  project_id?: number;
  activity_id?: number;
  issue_id?: number;
  comments?: string;
}
