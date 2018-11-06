import { HourGlassTimeTracker } from '../hourglass-time-tracker.interface';

export interface HourGlassTimeBookingsRequest {
  time_bookings: Partial<HourGlassTimeTracker>[];
}
