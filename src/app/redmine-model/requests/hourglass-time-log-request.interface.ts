import { HourGlassTimeLog } from '../hourglass-time-log.interface';

export interface HourGlassTimeLogRequest {
  time_log: Partial<HourGlassTimeLog>;
}
