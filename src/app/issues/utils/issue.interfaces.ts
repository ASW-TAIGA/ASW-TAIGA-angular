interface IssueStatus {
  id: string;
  name: string;
  color: string;
}

interface IssueType {
  id: string;
  name: string;
  icon: string;
}

interface Severity {
  id: string;
  name: string;
  level: number;
}

interface Priority {
  id: string;
  name: string;
  level: number;
}

interface UserProfile {
  uid: string;
  username: string;
  email: string;
}

// Backend representation of Issue (assuming IDs for foreign keys)
interface BackendIssue {
  id?: string; // Optional for creation
  title: string;
  description: string;
  status: string; // ID of IssueStatus
  issue_type: string; // ID of IssueType
  severity: string; // ID of Severity
  priority: string; // ID of Priority
  creator: string; // UID of UserProfile
  assignee?: string | null; // UID of UserProfile
  created_at?: string; // ISO string
  updated_at?: string; // ISO string
  deadline?: string | null; // ISO string
  watchers: string[]; // Array of UserProfile UIDs
}

// Frontend representation of Issue (with full objects)
export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  issue_type: IssueType;
  severity: Severity;
  priority: Priority;
  creator: UserProfile;
  assignee?: UserProfile;
  created_at: Date;
  updated_at: Date;
  deadline?: Date;
  watchers: UserProfile[];
}

// Backend representation of Comment
interface BackendComment {
  id?: string; // Optional for creation
  issue: string; // ID of Issue
  author: string; // UID of UserProfile
  text: string;
  created_at?: string; // ISO string
  updated_at?: string; // ISO string
}

// Frontend representation of Comment
export interface Comment {
  id: string;
  issueId: string;
  author: UserProfile;
  text: string;
  created_at: Date;
  updated_at: Date;
}

// Backend representation of Attachment
interface BackendAttachment {
  id?: string; // Optional for creation
  issue: string; // ID of Issue
  file: File | string; // File object for upload, string (URL) for retrieval
  uploaded_at?: string; // ISO string
  uploader?: string; // UID of UserProfile
}

// Frontend representation of Attachment
export interface Attachment {
  id: string;
  issueId: string;
  fileName: string;
  fileUrl?: string;
  uploaded_at: Date;
  uploader: UserProfile;
}
