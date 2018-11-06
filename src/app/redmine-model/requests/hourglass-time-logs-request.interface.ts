import { HourGlassTimeTracker } from '../hourglass-time-tracker.interface';

export interface TimeLogsRequest {
  time_logs: Partial<HourGlassTimeTracker>[];
}
