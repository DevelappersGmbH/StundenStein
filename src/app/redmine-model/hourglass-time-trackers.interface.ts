import { HourGlassTimeTracker } from './hourglass-time-tracker.interface';

export interface HourGlassTimeTrackers {
  count: number;
  offset: number;
  limit: number;
  records: HourGlassTimeTracker[];
}
