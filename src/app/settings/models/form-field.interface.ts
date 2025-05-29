// src/app/settings/models/form-field.interface.ts
import { ValidatorFn } from '@angular/forms';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'checkbox' | 'select';
  validators?: ValidatorFn[]; // Use ValidatorFn for better type safety
  options?: { value: string; viewValue: string }[]; // For select type
  defaultValue?: any;
  hint?: string;
}
