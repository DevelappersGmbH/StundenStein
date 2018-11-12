import { RedmineIssue } from './redmine-issue.interface';

export interface RedmineIssues {
  issues: RedmineIssue[];
  total_count: number;
  offset: number;
  limit: number;
}
