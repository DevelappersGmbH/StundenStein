import { HourGlassTimeTracker } from '../hourglass-time-tracker.interface';

export interface TimeLogsResponse {
  time_logs: Partial<HourGlassTimeTracker>[];
}
