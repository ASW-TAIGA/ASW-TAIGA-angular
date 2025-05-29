// src/app/settings/ui/setting-form-dialog/setting-form-dialog.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalRef } from '../../data-access/modal.service';
import { FormField } from '../../models/form-field.interface';

@Component({
  selector: 'app-setting-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative p-6 bg-white rounded-lg shadow-xl">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">
        {{ dialogTitle }}
      </h2>

      <form [formGroup]="settingForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4 mb-6">
          <div *ngFor="let field of formFields">
            <label
              [for]="field.key"
              class="block text-sm font-medium text-gray-700"
            >
              {{ field.label }}
            </label>
            <ng-container [ngSwitch]="field.type">
              <input
                *ngSwitchCase="'text'"
                [type]="field.type"
                [id]="field.key"
                [formControlName]="field.key"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                *ngSwitchCase="'number'"
                [type]="field.type"
                [id]="field.key"
                [formControlName]="field.key"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                *ngSwitchCase="'color'"
                [type]="field.type"
                [id]="field.key"
                [formControlName]="field.key"
                class="mt-1 block w-20 h-10 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
              />
              <div *ngSwitchCase="'checkbox'" class="flex items-center mt-2">
                <input
                  [type]="field.type"
                  [id]="field.key"
                  [formControlName]="field.key"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
            </ng-container>
            <div
              *ngIf="
                settingForm.get(field.key)?.invalid &&
                settingForm.get(field.key)?.touched
              "
              class="text-red-500 text-xs mt-1"
            >
              <span *ngIf="settingForm.get(field.key)?.errors?.['required']">
                {{ field.label }} is required.
              </span>
              <span *ngIf="settingForm.get(field.key)?.errors?.['minlength']">
                {{ field.label }} must be at least
                {{
                  settingForm.get(field.key)?.errors?.['minlength'].requiredLength
                }}
                characters.
              </span>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
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
            class="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isEdit ? 'Update' : 'Add' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class SettingFormDialogComponent implements OnInit {
  @Input() data: any; // Input to receive data from ModalService

  dialogTitle: string = 'Manage Setting';
  formFields: FormField[] = [];
  initialData: any = {};
  isEdit: boolean = false;

  settingForm!: FormGroup;
  private fb = inject(FormBuilder);
  private modalRef = inject(ModalRef); // Inject ModalRef to close the dialog

  ngOnInit(): void {
    if (this.data) {
      this.dialogTitle = this.data.dialogTitle || this.dialogTitle;
      this.formFields = this.data.formFields || [];
      this.initialData = this.data.initialData || {};
      this.isEdit = this.data.isEdit || false;
    }
    this.initForm();
  }

  initForm(): void {
    const formControls: { [key: string]: any } = {};
    this.formFields.forEach((field) => {
      const initialValue =
        this.initialData[field.key] !== undefined
          ? this.initialData[field.key]
          : field.defaultValue;

      formControls[field.key] = [initialValue, field.validators || []];
    });
    this.settingForm = this.fb.group(formControls);
  }

  onSubmit(): void {
    if (this.settingForm.valid) {
      this.modalRef.close(this.settingForm.value);
    } else {
      this.settingForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  onCancel(): void {
    this.modalRef.close(null); // Close the dialog without returning data
  }
}
