import { Issue } from "../issue.interface";

export interface IssuesRequest {
  issues:      Issue[];
  total_count: number;
  offset:      number;
  limit:       number;
}
