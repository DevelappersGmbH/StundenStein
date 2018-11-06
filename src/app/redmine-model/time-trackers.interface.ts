import { TimeTracker } from "./time-tracker.interface";

export interface TimeTrackers {
  count: number;
  offset: number;
  limit: number;
  records: TimeTracker[];
}
