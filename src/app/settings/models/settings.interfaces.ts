// src/app/settings/models/settings.interfaces.ts
export interface BaseSetting {
  id: number;
  name: string;
  color: string;
  order: number;
  [key: string]: any; // Add this line to allow dynamic property access
}

export interface BaseStatus extends BaseSetting {
  slug: string;
  is_closed: boolean;
}

export interface EpicStatus extends BaseStatus {}

export interface UserStoryStatus extends BaseStatus {
  archived: boolean;
}

export interface IssueStatus extends BaseStatus {}

export interface TaskStatus extends BaseStatus {}

export interface Priority extends BaseSetting {}

export interface Severity extends BaseSetting {}

export interface IssueType extends BaseSetting {}

export type CreateEpicStatusDTO = Omit<EpicStatus, 'id' | 'slug'>;
export type UpdateEpicStatusDTO = Partial<Omit<EpicStatus, 'id' | 'slug'>>;

export type CreateUserStoryStatusDTO = Omit<UserStoryStatus, 'id' | 'slug'>;
export type UpdateUserStoryStatusDTO = Partial<
  Omit<UserStoryStatus, 'id' | 'slug'>
>;

export type CreateIssueStatusDTO = Omit<IssueStatus, 'id' | 'slug'>;
export type UpdateIssueStatusDTO = Partial<Omit<IssueStatus, 'id' | 'slug'>>;

export type CreateTaskStatusDTO = Omit<TaskStatus, 'id' | 'slug'>;
export type UpdateTaskStatusDTO = Partial<Omit<TaskStatus, 'id' | 'slug'>>;

export type CreatePriorityDTO = Omit<Priority, 'id'>;
export type UpdatePriorityDTO = Partial<Omit<Priority, 'id'>>;

export type CreateSeverityDTO = Omit<Severity, 'id'>;
export type UpdateSeverityDTO = Partial<Omit<Severity, 'id'>>;

export type CreateIssueTypeDTO = Omit<IssueType, 'id'>;
export type UpdateIssueTypeDTO = Partial<Omit<IssueType, 'id'>>;
