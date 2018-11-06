import { TimeTracker } from "../time-tracker.interface";

export interface TimeBookingsRequest {
  time_bookings: Partial<TimeTracker>[];
}
