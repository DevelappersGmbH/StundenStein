import { HourGlassTimeTracker } from './hourglass-time-tracker.interface';

export interface HourGlassGroupedTimeLogs {
  time_sum: number;
  int_date: number;
  time_logs: HourGlassTimeTracker[];
}
