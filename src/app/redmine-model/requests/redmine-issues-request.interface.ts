import { RedmineIssue } from '../redmine-issue.interface';

export interface RedmineIssuesRequest {
  issues: RedmineIssue[];
  total_count: number;
  offset: number;
  limit: number;
}
