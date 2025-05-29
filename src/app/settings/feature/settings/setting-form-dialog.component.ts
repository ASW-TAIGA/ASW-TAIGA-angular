// src/app/settings/ui/setting-form-dialog/setting-form-dialog.component.ts
import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormField } from '../../models/form-field.interface'; // A new interface for form fields
//import { ModalRef } from '../../data-access/modal.service'; // Our custom modal ref

@Component({
  selector: 'app-setting-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="settingForm" class="p-4">
      <h3 class="text-lg font-semibold mb-4 text-gray-800">
        {{ dialogTitle }}
      </h3>

      <div *ngFor="let field of formFields" class="mb-4">
        <label
          [for]="field.key"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          {{ field.label }}
          <span
            *ngIf="field.validators?.includes(Validators.required)"
            class="text-red-500"
            >*</span
          >
        </label>

        <input
          *ngIf="field.type !== 'checkbox' && field.type !== 'select'"
          [id]="field.key"
          [type]="field.type"
          [formControlName]="field.key"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          [placeholder]="field.label"
        />

        <select
          *ngIf="field.type === 'select' && field.options"
          [id]="field.key"
          [formControlName]="field.key"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option *ngFor="let option of field.options" [value]="option.value">
            {{ option.viewValue }}
          </option>
        </select>

        <div *ngIf="field.type === 'checkbox'" class="flex items-center mt-2">
          <input
            [id]="field.key"
            type="checkbox"
            [formControlName]="field.key"
            class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label [for]="field.key" class="ml-2 block text-sm text-gray-900">{{
            field.label
          }}</label>
        </div>

        <p *ngIf="field.hint" class="mt-1 text-sm text-gray-500">
          {{ field.hint }}
        </p>

        <div
          *ngIf="
            settingForm.get(field.key)?.invalid &&
            settingForm.get(field.key)?.touched
          "
          class="text-red-600 text-sm mt-1"
        >
          {{ getErrorMessage(field.key, field.label) }}
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-6">
        <button
          type="button"
          (click)="onCancel()"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          [disabled]="settingForm.invalid"
          (click)="onSave()"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isEdit ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      /* No component-specific styles needed here, all via Tailwind */
    `,
  ],
})
export class SettingFormDialogComponent implements OnInit {
  // Inputs from ModalService config
  @Input() dialogTitle!: string;
  @Input() formFields!: FormField[];
  @Input() initialData?: any;
  @Input() isEdit!: boolean;

  // This will be set by the ModalRef instance
  // We use `any` here for flexibility with our custom ModalRef
  // In a more complex scenario, you might define a generic ModalRef<T> type
  @Input() dialogRef!: { close: (result?: any) => void };

  settingForm!: FormGroup;
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    // Define Validators dynamically for required fields based on FormField config
    const formGroupConfig: { [key: string]: any } = {};
    this.formFields.forEach((field) => {
      const value = this.initialData
        ? this.initialData[field.key]
        : field.defaultValue;
      formGroupConfig[field.key] = [value, field.validators || []];
    });
    this.settingForm = this.fb.group(formGroupConfig);
  }

  getErrorMessage(controlName: string, label: string): string {
    const control = this.settingForm.get(controlName);
    if (control?.hasError('required')) {
      return `${label} is required`;
    }
    if (control?.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength}`;
    }
    if (control?.hasError('maxlength')) {
      return `Maximum length is ${control.errors?.['maxlength'].requiredLength}`;
    }
    // Add more validation messages as needed
    return '';
  }

  onSave(): void {
    if (this.settingForm.valid) {
      this.dialogRef.close(this.settingForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
