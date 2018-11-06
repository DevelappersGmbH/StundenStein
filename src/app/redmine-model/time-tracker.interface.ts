import { Project } from './project.interface';

export interface TimeTracker {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  start: string;
  project_id: number;
  activity_id: number;
  issue_id: number;
  comments: string;

  project: Project;
}
