import { TimeBooking } from "./time-booking.interface";

export interface TimeBookings {
  count: number;
  offset: number;
  limit: number;
  records: TimeBooking[];
}
