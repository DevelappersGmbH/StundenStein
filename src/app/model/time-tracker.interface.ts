import { Issue } from './issue.interface';
import { Project } from './project.interface';

export interface TimeTracker {
  id: number;
  timeStarted: string;
  billable: boolean;
  comment?: string;
  issue?: Issue;
  project?: Project;
}
