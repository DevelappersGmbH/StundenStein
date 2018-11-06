import { TimeTracker } from "../time-tracker.interface";

export interface TimeLogsRequest {
  time_logs: Partial<TimeTracker>[];
}
