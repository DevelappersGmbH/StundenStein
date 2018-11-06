import { HourGlassTimeTracker } from '../hourglass-time-tracker.interface';

export interface HourGlassTimeTrackerRequest {
  time_tracker: Partial<HourGlassTimeTracker>;
}
