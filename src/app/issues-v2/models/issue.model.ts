import { User } from './user.model';
import { IssueStatus, IssueType, Severity, Priority } from './issue-meta.model';
import { Comment } from './comment.model';
import { Attachment } from './attachment.model';

export interface Issue {
  id: number;
  title: string;
  description?: string | null;
  status: IssueStatus;
  issue_type: IssueType;
  severity: Severity;
  priority: Priority;
  creator: User;
  assignee?: User | null;
  created_at: string;
  updated_at: string;
  deadline?: string | null;
  watchers: User[];
  comments?: Comment[]; // Or just IDs, depending on API detail level
  attachments?: Attachment[]; // Or just IDs
}

export interface CreateIssuePayload {
  title: string;
  description?: string;
  status_id?: number;
  priority_id?: number;
  severity_id?: number;
  issue_type_id?: number;
  assignee_id?: number | null;
  deadline?: string | null;
  watcher_ids?: number[];
}

export type UpdateIssuePayload = Partial<CreateIssuePayload>;

export interface AssignIssuePayload {
  assignee_id: number | null;
}

export interface BulkCreateIssuePayloadItem {
    title: string;
    description?: string;
    status_id?: number;
    priority_id?: number;
    severity_id?: number;
    issue_type_id?: number;
    assignee_id?: number | null;
    deadline?: string | null;
    watcher_ids?: number[];
}
