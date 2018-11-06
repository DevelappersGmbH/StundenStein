export interface CustomField {
  id: number;
  name: CustomFieldName;
  value: string;
}

export enum CustomFieldName {
  BetroffeneVersion = "Betroffene Version",
}
