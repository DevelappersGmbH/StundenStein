import { Reference } from "./reference.interface";

export interface Project {
  id: number;
  name: string;
  identifier: string;
  description: string;
  parent: Reference;
  status: number;
  created_on: Date;
  updated_on: Date;
}
