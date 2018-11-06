import { Project } from './project.interface';
import { User } from '../services/user/user.interface';

export interface Issue {
  id: number;
  subject: string;
  tracker: string;
  project: Project;
  assignedTo: User;
}
