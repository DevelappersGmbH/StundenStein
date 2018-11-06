import { HourGlassTimeBooking } from './hourglass-time-booking.interface';

export interface HourGlassTimeBookings {
  count: number;
  offset: number;
  limit: number;
  records: HourGlassTimeBooking[];
}
