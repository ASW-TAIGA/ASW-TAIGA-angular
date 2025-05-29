// src/app/settings/feature/issue-types-admin/issue-types-admin.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingAdminListComponent } from './setting-admin-list.component';
import { FormField } from '../../models/form-field.interface';
import {
  IssueType,
  CreateIssueTypeDTO,
  UpdateIssueTypeDTO,
} from '../../models/settings.interfaces';
import { Validators } from '@angular/forms';
import { Observable, of, delay } from 'rxjs';

// --- Dummy Data and Mock API Calls for Issue Types ---
let DUMMY_ISSUE_TYPES: IssueType[] = [
  { id: 1, name: 'Bug', color: '#dc3545', order: 10 },
  { id: 2, name: 'Feature', color: '#007bff', order: 20 },
  { id: 3, name: 'Question', color: '#ffc107', order: 30 },
];

let nextIssueTypeId = Math.max(...DUMMY_ISSUE_TYPES.map((i) => i.id)) + 1;

const getIssueTypesDummy = (): Observable<IssueType[]> => {
  return of([...DUMMY_ISSUE_TYPES]).pipe(delay(500));
};

const addIssueTypeDummy = (data: CreateIssueTypeDTO): Observable<IssueType> => {
  const newIssueType: IssueType = {
    id: nextIssueTypeId++,
    ...data,
    order: data.order || DUMMY_ISSUE_TYPES.length * 10 + 10,
  };
  DUMMY_ISSUE_TYPES.push(newIssueType);
  return of(newIssueType).pipe(delay(300));
};

const updateIssueTypeDummy = (
  id: number,
  data: UpdateIssueTypeDTO
): Observable<IssueType> => {
  const index = DUMMY_ISSUE_TYPES.findIndex((i) => i.id === id);
  if (index > -1) {
    const updatedIssueType = { ...DUMMY_ISSUE_TYPES[index], ...data };
    DUMMY_ISSUE_TYPES[index] = updatedIssueType;
    return of(updatedIssueType).pipe(delay(300));
  }
  return of(null as any);
};

const deleteIssueTypeDummy = (id: number): Observable<void> => {
  DUMMY_ISSUE_TYPES = DUMMY_ISSUE_TYPES.filter((i) => i.id !== id);
  return of(undefined).pipe(delay(300));
};
// --- End Dummy Data ---

@Component({
  selector: 'app-issue-types-admin',
  standalone: true,
  imports: [CommonModule, SettingAdminListComponent],
  template: `
    <app-setting-admin-list
      [apiGetMethod]="getIssueTypes"
      [apiAddMethod]="addIssueType"
      [apiUpdateMethod]="updateIssueType"
      [apiDeleteMethod]="deleteIssueType"
      [settingTypeLabel]="'Issue Type'"
      [formFields]="issueTypeFormFields"
      [displayColumns]="['name', 'color', 'order']"
    ></app-setting-admin-list>
  `,
})
export class IssueTypesAdminComponent implements OnInit {
  getIssueTypes = getIssueTypesDummy;
  addIssueType = addIssueTypeDummy;
  updateIssueType = updateIssueTypeDummy;
  deleteIssueType = deleteIssueTypeDummy;

  issueTypeFormFields: FormField[] = [
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
  ];

  constructor() {}

  ngOnInit(): void {}
}
