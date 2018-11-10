import { RedmineCustomField } from './redmine-custom-field.interface';
import { RedmineReference } from './redmine-reference.interface';

export interface RedmineIssue {
  id: number;
  project: RedmineReference;
  tracker: RedmineReference;
  status: RedmineReference;
  priority: RedmineReference;
  author: RedmineReference;
  assigned_to?: RedmineReference;
  subject: string;
  description: string;
  start_date: string;
  done_ratio: number;
  created_on: string;
  updated_on: string;
  custom_fields?: RedmineCustomField[];
  fixed_version?: RedmineReference;
}
