export interface Issue {
  id: number;
  number: number;
  description: string;
  subject: string;
  project: string;
  type: string;
  severity?: string;
  priority?: string;
  modified?: string;
  status: string;
  assignee?: {
    id: string | number;
    name: string;
    avatar?: string | null;
    initials?: string;
    avatarColorClass?: string;
  };
  reporter?: { id: string | number; name: string; avatar?: string };
  createdDate: string;
  updatedDate: string;
  tags?: string[];
  userStory?: { id: number; subject: string };
  isBlocked?: boolean;
  progress?: number;
  dueDate?: Date | null;
  reference?: string;
}

export interface IssueType {
  id: number;
  value: string;
  icon?: string;
  colorClass?: string; // e.g., 'text-red-500 bg-red-100'
  dotColorClass?: string; // For the colored dot, e.g., 'bg-red-500'
}

export interface IssueSeverity {
  id: number;
  value: string;
  icon?: string;
  colorClass?: string;
  dotColorClass?: string;
}

export interface IssuePriority {
  id: number;
  value: string;
  icon?: string;
  colorClass?: string;
  dotColorClass?: string;
}

export interface IssueStatus {
  id: number;
  value: string;
  category?: 'ToDo' | 'InProgress' | 'Done';
  colorClass?: string; // For text or background of status badge
  textColorClass?: string; // Specific text color for status
}
