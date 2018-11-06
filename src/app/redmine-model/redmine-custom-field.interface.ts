export interface RedmineCustomField {
  id: number;
  name: RedmineCustomFieldName;
  value: string;
}

export enum RedmineCustomFieldName {
  BetroffeneVersion = 'Betroffene Version'
}
