import { TimeTracker } from "../time-tracker.interface";

export interface TimeTrackerRequest {
  time_tracker: Partial<TimeTracker>;
}
