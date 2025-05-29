// src/app/settings/feature/statuses-admin/statuses-admin.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingAdminListComponent } from './setting-admin-list.component'; //
//
// Corrected path

import { FormField } from '../../models/form-field.interface';
import {
  EpicStatus,
  CreateEpicStatusDTO,
  UpdateEpicStatusDTO,
  UserStoryStatus,
  CreateUserStoryStatusDTO,
  UpdateUserStoryStatusDTO,
  IssueStatus,
  CreateIssueStatusDTO,
  UpdateIssueStatusDTO,
  TaskStatus,
  CreateTaskStatusDTO,
  UpdateTaskDTO,
} from '../../models/settings.interfaces';
import { Validators } from '@angular/forms';
import { Observable, of, delay } from 'rxjs';

// --- Dummy Data and Mock API Calls for Epic Statuses ---
let DUMMY_EPIC_STATUSES: EpicStatus[] = [
  {
    id: 1,
    name: 'Open',
    color: '#60A5FA',
    order: 10,
    slug: 'open',
    is_closed: false,
  },
  {
    id: 2,
    name: 'In Progress',
    color: '#FCD34D',
    order: 20,
    slug: 'in-progress',
    is_closed: false,
  },
  {
    id: 3,
    name: 'Closed',
    color: '#10B981',
    order: 30,
    slug: 'closed',
    is_closed: true,
  },
];
let nextEpicStatusId = Math.max(...DUMMY_EPIC_STATUSES.map((s) => s.id)) + 1;
const getEpicStatusesDummy = (): Observable<EpicStatus[]> =>
  of([...DUMMY_EPIC_STATUSES]).pipe(delay(500));
const addEpicStatusDummy = (
  data: CreateEpicStatusDTO
): Observable<EpicStatus> => {
  const newStatus: EpicStatus = {
    id: nextEpicStatusId++,
    name: data['name'], // Explicitly assign
    color: data['color'], // Explicitly assign
    order: data['order'] || DUMMY_EPIC_STATUSES.length * 10 + 10, // Explicitly assign with fallback
    slug: data.name.toLowerCase().replace(/\s/g, '-'),
    is_closed: data['is_closed'], // Explicitly assign
  };
  DUMMY_EPIC_STATUSES.push(newStatus);
  return of(newStatus).pipe(delay(300));
};
const updateEpicStatusDummy = (
  id: number,
  data: UpdateEpicStatusDTO
): Observable<EpicStatus> => {
  const index = DUMMY_EPIC_STATUSES.findIndex((s) => s.id === id);
  if (index > -1) {
    const updatedStatus = {
      ...DUMMY_EPIC_STATUSES[index],
      ...data,
      slug:
        data.name?.toLowerCase().replace(/\s/g, '-') ||
        DUMMY_EPIC_STATUSES[index].slug,
    };
    DUMMY_EPIC_STATUSES[index] = updatedStatus;
    return of(updatedStatus).pipe(delay(300));
  }
  return of(null as any);
};
const deleteEpicStatusDummy = (id: number): Observable<void> => {
  DUMMY_EPIC_STATUSES = DUMMY_EPIC_STATUSES.filter((s) => s.id !== id);
  return of(undefined).pipe(delay(300));
};

// --- Dummy Data and Mock API Calls for User Story Statuses ---
let DUMMY_USER_STORY_STATUSES: UserStoryStatus[] = [
  {
    id: 101,
    name: 'New',
    color: '#D1D5DB',
    order: 10,
    slug: 'new',
    is_closed: false,
    archived: false,
  },
  {
    id: 102,
    name: 'In Progress',
    color: '#FCD34D',
    order: 20,
    slug: 'in-progress',
    is_closed: false,
    archived: false,
  },
  {
    id: 103,
    name: 'Done',
    color: '#10B981',
    order: 30,
    slug: 'done',
    is_closed: true,
    archived: false,
  },
  {
    id: 104,
    name: 'Archived',
    color: '#6B7280',
    order: 40,
    slug: 'archived',
    is_closed: true,
    archived: true,
  },
];
let nextUserStoryStatusId =
  Math.max(...DUMMY_USER_STORY_STATUSES.map((s) => s.id)) + 1;
const getUserStoryStatusesDummy = (): Observable<UserStoryStatus[]> =>
  of([...DUMMY_USER_STORY_STATUSES]).pipe(delay(500));
const addUserStoryStatusDummy = (
  data: CreateUserStoryStatusDTO
): Observable<UserStoryStatus> => {
  const newStatus: UserStoryStatus = {
    id: nextUserStoryStatusId++,
    name: data['name'], // Explicitly assign
    color: data['color'], // Explicitly assign
    order: data['order'] || DUMMY_USER_STORY_STATUSES.length * 10 + 10, // Explicitly assign with fallback
    slug: data.name.toLowerCase().replace(/\s/g, '-'),
    is_closed: data['is_closed'], // Explicitly assign
    archived: data['archived'], // Explicitly assign
  };
  DUMMY_USER_STORY_STATUSES.push(newStatus);
  return of(newStatus).pipe(delay(300));
};
const updateUserStoryStatusDummy = (
  id: number,
  data: UpdateUserStoryStatusDTO
): Observable<UserStoryStatus> => {
  const index = DUMMY_USER_STORY_STATUSES.findIndex((s) => s.id === id);
  if (index > -1) {
    const updatedStatus = {
      ...DUMMY_USER_STORY_STATUSES[index],
      ...data,
      slug:
        data.name?.toLowerCase().replace(/\s/g, '-') ||
        DUMMY_USER_STORY_STATUSES[index].slug,
    };
    DUMMY_USER_STORY_STATUSES[index] = updatedStatus;
    return of(updatedStatus).pipe(delay(300));
  }
  return of(null as any);
};
const deleteUserStoryStatusDummy = (id: number): Observable<void> => {
  DUMMY_USER_STORY_STATUSES = DUMMY_USER_STORY_STATUSES.filter(
    (s) => s.id !== id
  );
  return of(undefined).pipe(delay(300));
};

// --- Dummy Data and Mock API Calls for Issue Statuses ---
let DUMMY_ISSUE_STATUSES: IssueStatus[] = [
  {
    id: 201,
    name: 'Open',
    color: '#EF4444',
    order: 10,
    slug: 'open',
    is_closed: false,
  },
  {
    id: 202,
    name: 'In Progress',
    color: '#FCD34D',
    order: 20,
    slug: 'in-progress',
    is_closed: false,
  },
  {
    id: 203,
    name: 'Resolved',
    color: '#3B82F6',
    order: 30,
    slug: 'resolved',
    is_closed: true,
  },
  {
    id: 204,
    name: 'Closed',
    color: '#10B981',
    order: 40,
    slug: 'closed',
    is_closed: true,
  },
];
let nextIssueStatusId = Math.max(...DUMMY_ISSUE_STATUSES.map((s) => s.id)) + 1;
const getIssueStatusesDummy = (): Observable<IssueStatus[]> =>
  of([...DUMMY_ISSUE_STATUSES]).pipe(delay(500));
const addIssueStatusDummy = (
  data: CreateIssueStatusDTO
): Observable<IssueStatus> => {
  const newStatus: IssueStatus = {
    id: nextIssueStatusId++,
    name: data['name'], // Explicitly assign
    color: data['color'], // Explicitly assign
    order: data['order'] || DUMMY_ISSUE_STATUSES.length * 10 + 10, // Explicitly assign with fallback
    slug: data.name.toLowerCase().replace(/\s/g, '-'),
    is_closed: data['is_closed'], // Explicitly assign
  };
  DUMMY_ISSUE_STATUSES.push(newStatus);
  return of(newStatus).pipe(delay(300));
};
const updateIssueStatusDummy = (
  id: number,
  data: UpdateIssueStatusDTO
): Observable<IssueStatus> => {
  const index = DUMMY_ISSUE_STATUSES.findIndex((s) => s.id === id);
  if (index > -1) {
    const updatedStatus = {
      ...DUMMY_ISSUE_STATUSES[index],
      ...data,
      slug:
        data.name?.toLowerCase().replace(/\s/g, '-') ||
        DUMMY_ISSUE_STATUSES[index].slug,
    };
    DUMMY_ISSUE_STATUSES[index] = updatedStatus;
    return of(updatedStatus).pipe(delay(300));
  }
  return of(null as any);
};
const deleteIssueStatusDummy = (id: number): Observable<void> => {
  DUMMY_ISSUE_STATUSES = DUMMY_ISSUE_STATUSES.filter((s) => s.id !== id);
  return of(undefined).pipe(delay(300));
};

// --- Dummy Data and Mock API Calls for Task Statuses ---
let DUMMY_TASK_STATUSES: TaskStatus[] = [
  {
    id: 301,
    name: 'To Do',
    color: '#9CA3AF',
    order: 10,
    slug: 'to-do',
    is_closed: false,
  },
  {
    id: 302,
    name: 'In Progress',
    color: '#FCD34D',
    order: 20,
    slug: 'in-progress',
    is_closed: false,
  },
  {
    id: 303,
    name: 'Done',
    color: '#10B981',
    order: 30,
    slug: 'done',
    is_closed: true,
  },
];
let nextTaskStatusId = Math.max(...DUMMY_TASK_STATUSES.map((s) => s.id)) + 1;
const getTaskStatusesDummy = (): Observable<TaskStatus[]> =>
  of([...DUMMY_TASK_STATUSES]).pipe(delay(500));
const addTaskStatusDummy = (
  data: CreateTaskStatusDTO
): Observable<TaskStatus> => {
  const newStatus: TaskStatus = {
    id: nextTaskStatusId++,
    name: data['name'], // Explicitly assign
    color: data['color'], // Explicitly assign
    order: data['order'] || DUMMY_TASK_STATUSES.length * 10 + 10, // Explicitly assign with fallback
    slug: data.name.toLowerCase().replace(/\s/g, '-'),
    is_closed: data['is_closed'], // Explicitly assign
  };
  DUMMY_TASK_STATUSES.push(newStatus);
  return of(newStatus).pipe(delay(300));
};
const updateTaskStatusDummy = (
  id: number,
  data: UpdateTaskDTO
): Observable<TaskStatus> => {
  // Corrected type: UpdateTaskDTO
  const index = DUMMY_TASK_STATUSES.findIndex((s) => s.id === id);
  if (index > -1) {
    const updatedStatus = {
      ...DUMMY_TASK_STATUSES[index],
      ...data,
      slug:
        data.name?.toLowerCase().replace(/\s/g, '-') ||
        DUMMY_TASK_STATUSES[index].slug,
    };
    DUMMY_TASK_STATUSES[index] = updatedStatus;
    return of(updatedStatus).pipe(delay(300));
  }
  return of(null as any);
};
const deleteTaskStatusDummy = (id: number): Observable<void> => {
  DUMMY_TASK_STATUSES = DUMMY_TASK_STATUSES.filter((s) => s.id !== id);
  return of(undefined).pipe(delay(300));
};

type StatusType = 'epic' | 'userStory' | 'issue' | 'task';

@Component({
  selector: 'app-statuses-admin',
  standalone: true,
  imports: [CommonModule, SettingAdminListComponent],
  template: `
    <div class="p-6 bg-white shadow rounded-lg">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">
        Status Administration
      </h2>

      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            *ngFor="let tab of statusTabs"
            (click)="selectStatusType(tab.type)"
            [ngClass]="{
              'border-indigo-500 text-indigo-600':
                selectedStatusType() === tab.type,
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300':
                selectedStatusType() !== tab.type
            }"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div [ngSwitch]="selectedStatusType()">
        <ng-container *ngSwitchCase="'epic'">
          <app-setting-admin-list
            [apiGetMethod]="getEpicStatuses"
            [apiAddMethod]="addEpicStatus"
            [apiUpdateMethod]="updateEpicStatus"
            [apiDeleteMethod]="deleteEpicStatus"
            [settingTypeLabel]="'Epic Status'"
            [formFields]="epicStatusFormFields"
            [displayColumns]="['name', 'color', 'order', 'slug', 'is_closed']"
          ></app-setting-admin-list>
        </ng-container>

        <ng-container *ngSwitchCase="'userStory'">
          <app-setting-admin-list
            [apiGetMethod]="getUserStoryStatuses"
            [apiAddMethod]="addUserStoryStatus"
            [apiUpdateMethod]="updateUserStoryStatus"
            [apiDeleteMethod]="deleteUserStoryStatus"
            [settingTypeLabel]="'User Story Status'"
            [formFields]="userStoryStatusFormFields"
            [displayColumns]="[
              'name',
              'color',
              'order',
              'slug',
              'is_closed',
              'archived'
            ]"
          ></app-setting-admin-list>
        </ng-container>

        <ng-container *ngSwitchCase="'issue'">
          <app-setting-admin-list
            [apiGetMethod]="getIssueStatuses"
            [apiAddMethod]="addIssueStatus"
            [apiUpdateMethod]="updateIssueStatus"
            [apiDeleteMethod]="deleteIssueStatus"
            [settingTypeLabel]="'Issue Status'"
            [formFields]="issueStatusFormFields"
            [displayColumns]="['name', 'color', 'order', 'slug', 'is_closed']"
          ></app-setting-admin-list>
        </ng-container>

        <ng-container *ngSwitchCase="'task'">
          <app-setting-admin-list
            [apiGetMethod]="getTaskStatuses"
            [apiAddMethod]="addTaskStatus"
            [apiUpdateMethod]="updateTaskStatus"
            [apiDeleteMethod]="deleteTaskStatus"
            [settingTypeLabel]="'Task Status'"
            [formFields]="taskStatusFormFields"
            [displayColumns]="['name', 'color', 'order', 'slug', 'is_closed']"
          ></app-setting-admin-list>
        </ng-container>
      </div>
    </div>
  `,
})
export class StatusesAdminComponent implements OnInit {
  selectedStatusType = signal<StatusType>('epic');

  statusTabs: { type: StatusType; label: string }[] = [
    { type: 'epic', label: 'Epic Statuses' },
    { type: 'userStory', label: 'User Story Statuses' },
    { type: 'issue', label: 'Issue Statuses' },
    { type: 'task', label: 'Task Statuses' },
  ];

  // Pass the dummy functions for each status type
  getEpicStatuses = getEpicStatusesDummy;
  addEpicStatus = addEpicStatusDummy;
  updateEpicStatus = updateEpicStatusDummy;
  deleteEpicStatus = deleteEpicStatusDummy;

  getUserStoryStatuses = getUserStoryStatusesDummy;
  addUserStoryStatus = addUserStoryStatusDummy;
  updateUserStoryStatus = updateUserStoryStatusDummy;
  deleteUserStoryStatus = deleteUserStoryStatusDummy;

  getIssueStatuses = getIssueStatusesDummy;
  addIssueStatus = addIssueStatusDummy;
  updateIssueStatus = updateIssueStatusDummy;
  deleteIssueStatus = deleteIssueStatusDummy;

  getTaskStatuses = getTaskStatusesDummy;
  addTaskStatus = addTaskStatusDummy;
  updateTaskStatus = updateTaskStatusDummy;
  deleteTaskStatus = deleteTaskStatusDummy;

  // Form field definitions for each status type
  epicStatusFormFields: FormField[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      validators: [Validators.required, Validators.minLength(2)],
    },
    {
      key: 'color',
      label: 'Color',
      type: 'color',
      defaultValue: '#cccccc',
      validators: [Validators.required],
    },
    {
      key: 'order',
      label: 'Order',
      type: 'number',
      defaultValue: 0,
      validators: [Validators.required],
    },
    {
      key: 'is_closed',
      label: 'Is Closed',
      type: 'checkbox',
      defaultValue: false,
    },
  ];

  userStoryStatusFormFields: FormField[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      validators: [Validators.required, Validators.minLength(2)],
    },
    {
      key: 'color',
      label: 'Color',
      type: 'color',
      defaultValue: '#cccccc',
      validators: [Validators.required],
    },
    {
      key: 'order',
      label: 'Order',
      type: 'number',
      defaultValue: 0,
      validators: [Validators.required],
    },
    {
      key: 'is_closed',
      label: 'Is Closed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      key: 'archived',
      label: 'Is Archived',
      type: 'checkbox',
      defaultValue: false,
    },
  ];

  issueStatusFormFields: FormField[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      validators: [Validators.required, Validators.minLength(2)],
    },
    {
      key: 'color',
      label: 'Color',
      type: 'color',
      defaultValue: '#cccccc',
      validators: [Validators.required],
    },
    {
      key: 'order',
      label: 'Order',
      type: 'number',
      defaultValue: 0,
      validators: [Validators.required],
    },
    {
      key: 'is_closed',
      label: 'Is Closed',
      type: 'checkbox',
      defaultValue: false,
    },
  ];

  taskStatusFormFields: FormField[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      validators: [Validators.required, Validators.minLength(2)],
    },
    {
      key: 'color',
      label: 'Color',
      type: 'color',
      defaultValue: '#cccccc',
      validators: [Validators.required],
    },
    {
      key: 'order',
      label: 'Order',
      type: 'number',
      defaultValue: 0,
      validators: [Validators.required],
    },
    {
      key: 'is_closed',
      label: 'Is Closed',
      type: 'checkbox',
      defaultValue: false,
    },
  ];

  constructor() {}

  ngOnInit(): void {}

  selectStatusType(type: StatusType): void {
    this.selectedStatusType.set(type);
  }
}
