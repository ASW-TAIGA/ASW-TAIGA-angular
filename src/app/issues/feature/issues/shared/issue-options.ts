// src/app/issues/shared/issue-options.ts
import {
  IssueType,
  IssueSeverity,
  IssuePriority,
  IssueStatus,
} from '../models/issue-model';

export const TYPE_OPTIONS: IssueType[] = [
  {
    id: 1,
    value: 'Bug',
    icon: 'bug',
    colorClass: 'bg-red-600 text-white',
    dotColorClass: 'bg-red-500',
  },
  {
    id: 2,
    value: 'Question',
    icon: 'question-mark-circle',
    colorClass: 'bg-blue-600 text-white',
    dotColorClass: 'bg-blue-500',
  },
  {
    id: 3,
    value: 'Enhancement',
    icon: 'sparkles',
    colorClass: 'bg-green-600 text-white',
    dotColorClass: 'bg-green-500',
  },
  {
    id: 4,
    value: 'Task',
    icon: 'clipboard-document-check',
    colorClass: 'bg-purple-600 text-white',
    dotColorClass: 'bg-purple-500',
  },
  {
    id: 5,
    value: 'Story',
    icon: 'book-open',
    colorClass: 'bg-yellow-500 text-white',
    dotColorClass: 'bg-yellow-400',
  },
];

export const SEVERITY_OPTIONS: IssueSeverity[] = [
  {
    id: 1,
    value: 'Minor',
    colorClass: 'text-gray-400',
    dotColorClass: 'bg-gray-400',
  },
  {
    id: 2,
    value: 'Normal',
    colorClass: 'text-sky-400',
    dotColorClass: 'bg-sky-400',
  },
  {
    id: 3,
    value: 'Major',
    colorClass: 'text-yellow-400',
    dotColorClass: 'bg-yellow-400',
  },
  {
    id: 4,
    value: 'Critical',
    colorClass: 'text-red-400 font-semibold',
    dotColorClass: 'bg-red-400',
  },
];

export const PRIORITY_OPTIONS: IssuePriority[] = [
  {
    id: 1,
    value: 'Low',
    icon: 'arrow-down',
    colorClass: 'text-gray-400',
    dotColorClass: 'bg-gray-400',
  },
  {
    id: 2,
    value: 'Normal',
    icon: 'minus-small',
    colorClass: 'text-sky-400',
    dotColorClass: 'bg-sky-400',
  },
  {
    id: 3,
    value: 'High',
    icon: 'arrow-up',
    colorClass: 'text-orange-400',
    dotColorClass: 'bg-orange-400',
  },
  {
    id: 4,
    value: 'Urgent',
    icon: 'exclamation-circle',
    colorClass: 'text-red-400 font-semibold',
    dotColorClass: 'bg-red-400',
  },
];

export const STATUS_OPTIONS: IssueStatus[] = [
  { id: 1, value: 'New', category: 'ToDo', textColorClass: 'text-sky-300' },
  {
    id: 2,
    value: 'In Progress',
    category: 'InProgress',
    textColorClass: 'text-yellow-300',
  },
  {
    id: 3,
    value: 'Ready for Test',
    category: 'InProgress',
    textColorClass: 'text-purple-300',
  },
  {
    id: 4,
    value: 'Closed',
    category: 'Done',
    textColorClass: 'text-green-400',
  },
  {
    id: 5,
    value: 'Rejected',
    category: 'Done',
    textColorClass: 'text-red-400',
  },
  {
    id: 6,
    value: 'Postponed',
    category: 'ToDo',
    textColorClass: 'text-gray-400',
  },
];

// Helper functions to get values
export function getOptionById<T extends { id: number; value: string }>(
  options: T[],
  id: number | undefined
): T | undefined {
  if (id === undefined) return undefined;
  return options.find((opt) => opt.id === id);
}

export function getAssigneeInitials(name?: string): string {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Simple consistent color for initials based on name
const avatarColors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];

export function getAvatarColorClass(name?: string): string {
  if (!name) return 'bg-gray-500';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % avatarColors.length);
  return avatarColors[index] + ' text-white';
}
