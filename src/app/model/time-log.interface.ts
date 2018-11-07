import { Issue } from './issue.interface';
import { Project } from './project.interface';
import { User } from './user.interface';

export interface TimeLog {
  id: number;
  timeStarted: string;
  timeStopped: string;
  comment: string;
  timeInHours: number;
  booked: boolean;
  hourGlassTimeBookingId: number;
  billable: boolean;
  issue: Issue;
  project: Project;
  user: User;
}
