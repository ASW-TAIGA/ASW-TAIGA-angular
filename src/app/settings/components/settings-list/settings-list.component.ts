import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IssueStatus, IssueMeta } from '../../../issues-v2/models'; // Corrected path assuming models are in 'issues'
import { Observable } from 'rxjs';


// A generic type for any of our settings items
type SettingItem = IssueStatus | IssueMeta; // IssueStatus includes all fields of IssueMeta plus its own

@Component({
  selector: 'app-settings-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.css']
})
export class SettingsListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  config = signal<{ settingType: string; title: string; itemLabel: string; endpoint: string; formFields: string[] } | null>(null);
  
  items: WritableSignal<SettingItem[]> = signal([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  showFormModal = signal(false);
  isEditMode = signal(false);
  currentItemId: WritableSignal<number | null> = signal(null);
  itemForm!: FormGroup;

  // Signals for delete confirmation modal
  showDeleteConfirmModal = signal(false);
  itemToDeleteId: WritableSignal<number | null> = signal(null);
  itemToDeleteName: WritableSignal<string | null> = signal(null);
  isDeleting = signal(false);


  // Helper to cast item to IssueStatus if it has 'is_closed' property
  isIssueStatus(item: SettingItem): item is IssueStatus {
    return 'is_closed' in item;
  }

  constructor() {
    this.route.data.subscribe(data => {
      // It's good practice to clear previous state when config changes
      this.items.set([]);
      this.error.set(null);
      this.isLoading.set(true); // Set loading true before re-initializing and loading
      
      this.config.set(data as any);
      this.initializeForm();
      this.loadItems();
    });
  }

  ngOnInit(): void {
    // Data loading is triggered by route data subscription
  }

  initializeForm(): void {
    const currentConfig = this.config();
    if (!currentConfig) return;

    const formControls: { [key: string]: any } = {};
    if (currentConfig.formFields.includes('name')) {
      formControls['name'] = ['', Validators.required];
    }
    if (currentConfig.formFields.includes('color')) {
      formControls['color'] = ['#CCCCCC', [Validators.required, Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)]];
    }
    if (currentConfig.formFields.includes('order')) {
      formControls['order'] = [10, [Validators.required, Validators.min(0)]];
    }
    if (currentConfig.formFields.includes('is_closed')) {
      formControls['is_closed'] = [false];
    }
    this.itemForm = this.fb.group(formControls);
  }

  loadItems(): void {
    const currentConfig = this.config();
    if (!currentConfig) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.apiService.get<SettingItem[]>(currentConfig.endpoint)
      .subscribe({
        next: (data) => {
          this.items.set(data.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || (a.name ?? '').localeCompare(b.name ?? '')));
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(`Failed to load ${currentConfig.title.toLowerCase()}. Please try again.`);
          console.error(err);
          this.isLoading.set(false);
        }
      });
  }

  openFormModal(item?: SettingItem): void {
    this.itemForm.reset(); 
    const currentConfig = this.config();
    if (!currentConfig) return;

    const defaultValues: { [key: string]: any } = {};
     if (currentConfig.formFields.includes('name')) defaultValues['name'] = '';
     if (currentConfig.formFields.includes('color')) defaultValues['color'] = '#CCCCCC';
     if (currentConfig.formFields.includes('order')) defaultValues['order'] = (this.items()?.length + 1) * 10 || 10;
     if (currentConfig.formFields.includes('is_closed')) defaultValues['is_closed'] = false;
    this.itemForm.patchValue(defaultValues);

    if (item) {
      this.isEditMode.set(true);
      this.currentItemId.set(item.id);
      const patchData: any = {
        name: item.name,
        color: item.color || '#CCCCCC',
        order: item.order || 10,
      };
      if (this.isIssueStatus(item) && currentConfig.formFields.includes('is_closed')) {
        patchData.is_closed = item.is_closed || false;
      }
      this.itemForm.patchValue(patchData);
    } else {
      this.isEditMode.set(false);
      this.currentItemId.set(null);
    }
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.itemForm.reset();
    this.currentItemId.set(null);
    this.isEditMode.set(false);
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }
    const currentConfig = this.config();
    if (!currentConfig) return;

    this.isDeleting.set(false); // Ensure isDeleting is false when submitting form
    const formValue = this.itemForm.value;
    let operation: Observable<SettingItem>;

    if (this.isEditMode() && this.currentItemId()) {
      operation = this.apiService.put<SettingItem>(`${currentConfig.endpoint}${this.currentItemId()}/`, formValue);
    } else {
      operation = this.apiService.post<SettingItem>(currentConfig.endpoint, formValue);
    }

    operation.subscribe({
      next: () => {
        this.loadItems(); 
        this.closeFormModal();
      },
      error: (err) => {
        const detail = err.error && typeof err.error === 'object' ? JSON.stringify(err.error) : err.message;
        alert(`Error saving ${currentConfig.itemLabel.toLowerCase()}: ${detail || 'Please try again.'}`);
        console.error(err);
      }
    });
  }

  openDeleteConfirmModal(item: SettingItem): void {
    this.itemToDeleteId.set(item.id);
    this.itemToDeleteName.set(item.name);
    this.showDeleteConfirmModal.set(true);
  }

  closeDeleteConfirmModal(): void {
    this.showDeleteConfirmModal.set(false);
    this.itemToDeleteId.set(null);
    this.itemToDeleteName.set(null);
    this.isDeleting.set(false);
  }

  confirmDeleteItem(): void {
    const currentConfig = this.config();
    const itemId = this.itemToDeleteId();
    if (!currentConfig || itemId === null) {
      return;
    }

    this.isDeleting.set(true);
    this.apiService.delete(`${currentConfig.endpoint}${itemId}/`)
      .subscribe({
        next: () => {
          this.loadItems(); 
          this.closeDeleteConfirmModal();
        },
        error: (err) => {
          const detail = err.error && typeof err.error === 'object' ? JSON.stringify(err.error) : err.message;
          alert(`Error deleting ${currentConfig.itemLabel.toLowerCase()}: ${detail || 'Please try again.'}`);
          console.error(err);
          this.isDeleting.set(false); // Ensure isDeleting is reset on error
        }
      });
  }

  hasField(fieldName: string): boolean {
    return this.config()?.formFields.includes(fieldName) || false;
  }

  getTextColor(backgroundColor: string | undefined | null): string {
    if (!backgroundColor) {
      return '#000000'; 
    }
    try {
      const hex = backgroundColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return luma > 128 ? '#000000' : '#FFFFFF'; 
    } catch (e) {
      return '#000000'; 
    }
  }
}

