import { TimeTracker } from "./time-tracker.interface";

export interface GroupedTimeLogs {
  time_sum: number;
  int_date: number;
  time_logs: TimeTracker[];
}
