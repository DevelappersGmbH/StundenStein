export interface HourGlassTimeLog {
  id: number;
  start: string;
  stop: string;
  comments?: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
  hours: number;
}
