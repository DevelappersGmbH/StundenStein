import { HourGlassTimeBooking } from '../hourglass-time-booking.interface';

export interface HourGlassTimeLogBookRequest {
  time_booking: HourGlassTimeLogBookRequestTimeBooking;
}

export interface HourGlassTimeLogBookRequestTimeBooking {
  start: string;
  stop: string;
  user_id: number;
  project_id: number;
  activity_id: number;
  issue_id: number;
  comments: string;
}
