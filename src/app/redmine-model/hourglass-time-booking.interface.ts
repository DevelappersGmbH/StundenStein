import { RedmineTimeEntry } from './redmine-time-entry.interface';

export interface HourGlassTimeBooking {
  id: number;
  start: string;
  stop: string;
  time_log_id: number;
  time_entry_id: number;
  created_at: string;
  updated_at: string;
  time_entry: RedmineTimeEntry;
}
