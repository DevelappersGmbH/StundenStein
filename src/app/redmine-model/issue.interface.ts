import { Reference } from "./reference.interface";
import { CustomField } from "./custom-field.interface";

export interface Issue {
  id: number;
  project: Reference;
  tracker: Reference;
  status: Reference;
  priority: Reference;
  author: Reference;
  assigned_to?: Reference;
  subject: string;
  description: string;
  start_date: string;
  done_ratio: number;
  created_on: string;
  updated_on: string;
  custom_fields?: CustomField[];
  fixed_version?: Reference;
}
