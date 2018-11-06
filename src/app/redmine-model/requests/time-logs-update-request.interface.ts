import { TimeTracker } from "../time-tracker.interface";

export interface TimeLogsUpdateRequest {
  success: Partial<TimeTracker>[];
  error: any;
}
