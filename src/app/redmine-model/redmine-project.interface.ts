import { RedmineReference } from './redmine-reference.interface';

export interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
  description: string;
  parent: RedmineReference;
  status: number;
  created_on: string;
  updated_on: string;
}
