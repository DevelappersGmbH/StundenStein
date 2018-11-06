export interface RedmineTimeEntry {
  id: number;
  project_id: number;
  user_id: number;
  issue_id: number;
  hours: number;
  comments: string;
  activity_id: number;
  spent_on: string;
  tyear: number;
  tmonth: number;
  tweek: number;
  created_on: string;
  updated_on: string;
}
