import { HourGlassTimeLog } from './hourglass-time-log.interface';

export interface HourGlassTimeLogs {
  count: number;
  offset: number;
  limit: number;
  records: HourGlassTimeLog[];
}
