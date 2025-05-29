// src/app/settings/feature/severities-admin/severities-admin.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingAdminListComponent } from './setting-admin-list.component'; // Corrected path
import { FormField } from '../../models/form-field.interface';
import {
  Severity,
  CreateSeverityDTO,
  UpdateSeverityDTO,
} from '../../models/settings.interfaces';
import { Validators } from '@angular/forms';
import { Observable, of, delay } from 'rxjs';

// --- Dummy Data and Mock API Calls for Severities ---
let DUMMY_SEVERITIES: Severity[] = [
  { id: 1, name: 'Minor', color: '#28a745', order: 10 },
  { id: 2, name: 'Normal', color: '#17a2b8', order: 20 },
  { id: 3, name: 'Major', color: '#ffc107', order: 30 },
  { id: 4, name: 'Critical', color: '#dc3545', order: 40 },
];

let nextSeverityId = Math.max(...DUMMY_SEVERITIES.map((s) => s.id)) + 1;

const getSeveritiesDummy = (): Observable<Severity[]> => {
  return of([...DUMMY_SEVERITIES]).pipe(delay(500));
};

const addSeverityDummy = (data: CreateSeverityDTO): Observable<Severity> => {
  const newSeverity: Severity = {
    id: nextSeverityId++,
    name: data['name'], // Explicitly assign name
    color: data['color'], // Explicitly assign color
    order: data['order'] || DUMMY_SEVERITIES.length * 10 + 10, // Use bracket notation for order
  };
  DUMMY_SEVERITIES.push(newSeverity);
  return of(newSeverity).pipe(delay(300));
};

const updateSeverityDummy = (
  id: number,
  data: UpdateSeverityDTO
): Observable<Severity> => {
  const index = DUMMY_SEVERITIES.findIndex((s) => s.id === id);
  if (index > -1) {
    const updatedSeverity = { ...DUMMY_SEVERITIES[index], ...data };
    DUMMY_SEVERITIES[index] = updatedSeverity;
    return of(updatedSeverity).pipe(delay(300));
  }
  return of(null as any);
};

const deleteSeverityDummy = (id: number): Observable<void> => {
  DUMMY_SEVERITIES = DUMMY_SEVERITIES.filter((s) => s.id !== id);
  return of(undefined).pipe(delay(300));
};
// --- End Dummy Data ---

@Component({
  selector: 'app-severities-admin',
  standalone: true,
  imports: [CommonModule, SettingAdminListComponent],
  template: `
    <app-setting-admin-list
      [apiGetMethod]="getSeverities"
      [apiAddMethod]="addSeverity"
      [apiUpdateMethod]="updateSeverity"
      [apiDeleteMethod]="deleteSeverity"
      [settingTypeLabel]="'Severity'"
      [formFields]="severityFormFields"
      [displayColumns]="['name', 'color', 'order']"
    ></app-setting-admin-list>
  `,
})
export class SeveritiesAdminComponent implements OnInit {
  getSeverities = getSeveritiesDummy;
  addSeverity = addSeverityDummy;
  updateSeverity = updateSeverityDummy;
  deleteSeverity = deleteSeverityDummy;

  severityFormFields: FormField[] = [
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
