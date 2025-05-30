export interface IssueMeta {
  id: number;
  name: string;
  description?: string;
  color?: string;
  order?: number;
}

export interface IssueStatus extends IssueMeta {
  slug?: string; // Added
  is_closed?: boolean; // Added
}

export type IssueType = IssueMeta;
export type Severity = IssueMeta;
export type Priority = IssueMeta;
