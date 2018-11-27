import { HourGlassTimeTracker } from '../hourglass-time-tracker.interface';

export interface HourGlassTimeBookingsResponse {
  time_bookings: Partial<HourGlassTimeTracker>[];
}
