import { HourGlassTimeTracker } from '../hourglass-time-tracker.interface';

export interface HourGlassTimeLogsUpdateRequest {
  success: Partial<HourGlassTimeTracker>[];
  error: any;
}
