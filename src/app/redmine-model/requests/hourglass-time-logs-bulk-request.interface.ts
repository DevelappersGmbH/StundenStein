import { TimeLog } from 'src/app/model/time-log.interface';

export interface HourGlassTimeLogsBulkRequest {
  time_logs: Partial<TimeLog>[];
}
