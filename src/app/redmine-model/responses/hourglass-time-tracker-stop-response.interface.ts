import { HourGlassTimeBooking } from '../hourglass-time-booking.interface';
import { TimeLog } from 'src/app/model/time-log.interface';

export interface HourGlassTimeTrackerStopResponse {
  time_log?: TimeLog;
  time_booking?: HourGlassTimeBooking;
}
