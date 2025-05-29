// src/app/settings/feature/priorities-admin/priorities-admin.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingAdminListComponent } from './setting-admin-list.component'; // Corrected path
import { FormField } from '../../models/form-field.interface';
import {
  Priority,
  CreatePriorityDTO,
  UpdatePriorityDTO,
} from '../../models/settings.interfaces';
import { Validators } from '@angular/forms';
import { Observable, of, delay } from 'rxjs';

// --- Dummy Data and Mock API Calls for Priorities ---
let DUMMY_PRIORITIES: Priority[] = [
  { id: 1, name: 'Low', color: '#007bff', order: 10 },
  { id: 2, name: 'Normal', color: '#6c757d', order: 20 },
  { id: 3, name: 'High', color: '#ffc107', order: 30 },
  { id: 4, name: 'Urgent', color: '#dc3545', order: 40 },
];

let nextPriorityId = Math.max(...DUMMY_PRIORITIES.map((p) => p.id)) + 1;

const getPrioritiesDummy = (): Observable<Priority[]> => {
  return of([...DUMMY_PRIORITIES]).pipe(delay(500));
};

const addPriorityDummy = (data: CreatePriorityDTO): Observable<Priority> => {
  const newPriority: Priority = {
    id: nextPriorityId++,
    name: data['name'], // Explicitly assign name
    color: data['color'], // Explicitly assign color
    order: data['order'] || DUMMY_PRIORITIES.length * 10 + 10, // Use bracket notation for order
  };
  DUMMY_PRIORITIES.push(newPriority);
  return of(newPriority).pipe(delay(300));
};

const updatePriorityDummy = (
  id: number,
  data: UpdatePriorityDTO
): Observable<Priority> => {
  const index = DUMMY_PRIORITIES.findIndex((p) => p.id === id);
  if (index > -1) {
    const updatedPriority = { ...DUMMY_PRIORITIES[index], ...data };
    DUMMY_PRIORITIES[index] = updatedPriority;
    return of(updatedPriority).pipe(delay(300));
  }
  return of(null as any); // Should handle error more gracefully in a real app
};

const deletePriorityDummy = (id: number): Observable<void> => {
  DUMMY_PRIORITIES = DUMMY_PRIORITIES.filter((p) => p.id !== id);
  return of(undefined).pipe(delay(300));
};
// --- End Dummy Data ---

@Component({
  selector: 'app-priorities-admin',
  standalone: true,
  imports: [CommonModule, SettingAdminListComponent],
  template: `
    <app-setting-admin-list
      [apiGetMethod]="getPriorities"
      [apiAddMethod]="addPriority"
      [apiUpdateMethod]="updatePriority"
      [apiDeleteMethod]="deletePriority"
      [settingTypeLabel]="'Priority'"
      [formFields]="priorityFormFields"
      [displayColumns]="['name', 'color', 'order']"
    ></app-setting-admin-list>
  `,
})
export class PrioritiesAdminComponent implements OnInit {
  // Pass the dummy functions directly
  getPriorities = getPrioritiesDummy;
  addPriority = addPriorityDummy;
  updatePriority = updatePriorityDummy;
  deletePriority = deletePriorityDummy;

  priorityFormFields: FormField[] = [
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
