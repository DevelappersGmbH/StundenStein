import { RedmineTimeEntry } from '../redmine-time-entry.interface';

export interface RedmineTimeEntryRequest {
  time_entry: Partial<RedmineTimeEntry>;
}
