// src/app/settings/ui/setting-admin-list/setting-admin-list.component.ts
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../data-access/modal.service'; // Our custom modal service
import { SettingFormDialogComponent } from './setting-form-dialog.component'; // Corrected: FormField removed from here
import { FormField } from '../../models/form-field.interface'; // Corrected: FormField imported from its dedicated file
import { Observable, catchError, finalize, of, tap, delay } from 'rxjs';
import { BaseSetting } from '../../models/settings.interfaces'; // Adjust path if needed

@Component({
  selector: 'app-setting-admin-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="setting-admin-container p-6 bg-white shadow rounded-lg">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          {{ settingTypeLabel }} Administration
        </h2>
        <button
          (click)="addSetting()"
          class="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Add {{ settingTypeLabel }}</span>
        </button>
      </div>

      <ng-container *ngIf="!loading(); else loadingSpinner">
        <div *ngIf="settings().length > 0; else noSettings">
          <div class="overflow-x-auto">
            <table
              class="min-w-full bg-white border border-gray-200 rounded-md"
            >
              <thead class="bg-gray-100">
                <tr>
                  <th
                    *ngFor="let col of displayColumns"
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ col | titlecase }}
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let element of settings()" class="hover:bg-gray-50">
                  <td
                    *ngFor="let col of displayColumns"
                    class="px-4 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    <ng-container *ngIf="col === 'color'; else defaultCell">
                      <div class="flex items-center">
                        <div
                          class="w-6 h-6 rounded-full border border-gray-300 mr-2"
                          [style.backgroundColor]="element[col]"
                        ></div>
                        <span>{{ element[col] }}</span>
                      </div>
                    </ng-container>
                    <ng-template #defaultCell>
                      {{ element[col] }}
                    </ng-template>
                  </td>
                  <td
                    class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium"
                  >
                    <button
                      (click)="editSetting(element)"
                      class="text-indigo-600 hover:text-indigo-900 mr-2 p-1 rounded-full hover:bg-gray-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          d="M13.586 3.586a2 2 0 112.828 2.828l-7.793 7.793-2.828.707.707-2.828 7.793-7.793zM10.146 5.146a.5.5 0 01.708 0l2.828 2.828a.5.5 0 010 .708l-7.793 7.793a.5.5 0 01-.177.124l-3.536.884a.5.5 0 01-.62-.62l.884-3.536a.5.5 0 01.124-.177l7.793-7.793z"
                        />
                      </svg>
                    </button>
                    <button
                      (click)="deleteSetting(element.id)"
                      class="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-gray-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 6a1 1 0 100 2h2a1 1 0 100-2H9z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <ng-template #noSettings>
          <p class="text-center text-gray-600 mt-8">
            No {{ settingTypeLabel | lowercase }} found. Click 'Add
            {{ settingTypeLabel }}' to create one.
          </p>
        </ng-template>
      </ng-container>

      <ng-template #loadingSpinner>
        <div class="flex flex-col items-center justify-center h-48">
          <svg
            class="animate-spin h-8 w-8 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="mt-4 text-gray-600">
            Loading {{ settingTypeLabel | lowercase }}...
          </p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      /* No specific Angular styles needed, all styling via Tailwind classes in template */
    `,
  ],
})
export class SettingAdminListComponent<
  T extends BaseSetting,
  CreateDTO,
  UpdateDTO
> implements OnInit
{
  @Input({ required: true }) apiGetMethod!: () => Observable<T[]>;
  @Input({ required: true }) apiAddMethod!: (data: CreateDTO) => Observable<T>;
  @Input({ required: true }) apiUpdateMethod!: (
    id: number,
    data: UpdateDTO
  ) => Observable<T>;
  @Input({ required: true }) apiDeleteMethod!: (id: number) => Observable<void>;
  @Input({ required: true }) settingTypeLabel!: string;
  @Input({ required: true }) formFields!: FormField[]; // Correctly typed as FormField[]
  @Input({ required: true }) displayColumns!: string[];
  @Input() dialogTitle: string = 'Manage Setting';

  readonly modalService = inject(ModalService);

  settings = signal<T[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.apiGetMethod()
      .pipe(
        delay(500),
        tap((data) => this.settings.set(data)),
        catchError((error) => {
          console.error('Error loading settings:', error);
          alert(`Failed to load ${this.settingTypeLabel}s.`);
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }

  addSetting(): void {
    this.modalService
      .open(SettingFormDialogComponent, {
        data: {
          dialogTitle: `Add New ${this.settingTypeLabel}`,
          formFields: this.formFields,
          isEdit: false,
        },
        panelClass: 'max-w-xl w-full',
      })
      .then((result) => {
        if (result) {
          this.apiAddMethod(result)
            .pipe(
              delay(300),
              tap((newSetting) => {
                this.settings.update((currentSettings) => [
                  ...currentSettings,
                  newSetting,
                ]);
                alert(`${this.settingTypeLabel} added successfully!`);
              }),
              catchError((error) => {
                console.error(`Error adding ${this.settingTypeLabel}:`, error);
                alert(`Failed to add ${this.settingTypeLabel}.`);
                return of(null);
              })
            )
            .subscribe();
        }
      });
  }

  editSetting(setting: T): void {
    this.modalService
      .open(SettingFormDialogComponent, {
        data: {
          dialogTitle: `Edit ${this.settingTypeLabel}`,
          formFields: this.formFields,
          initialData: setting,
          isEdit: true,
        },
        panelClass: 'max-w-xl w-full',
      })
      .then((result) => {
        if (result) {
          this.apiUpdateMethod(setting.id, result)
            .pipe(
              delay(300),
              tap((updatedSetting) => {
                this.settings.update((currentSettings) =>
                  currentSettings.map((s) =>
                    s.id === updatedSetting.id ? updatedSetting : s
                  )
                );
                alert(`${this.settingTypeLabel} updated successfully!`);
              }),
              catchError((error) => {
                console.error(
                  `Error updating ${this.settingTypeLabel}:`,
                  error
                );
                alert(`Failed to update ${this.settingTypeLabel}.`);
                return of(null);
              })
            )
            .subscribe();
        }
      });
  }

  deleteSetting(id: number): void {
    if (
      confirm(`Are you sure you want to delete this ${this.settingTypeLabel}?`)
    ) {
      this.apiDeleteMethod(id)
        .pipe(
          delay(300),
          tap(() => {
            this.settings.update((currentSettings) =>
              currentSettings.filter((s) => s.id !== id)
            );
            alert(`${this.settingTypeLabel} deleted successfully!`);
          }),
          catchError((error) => {
            console.error(`Error deleting ${this.settingTypeLabel}:`, error);
            alert(`Failed to delete ${this.settingTypeLabel}.`);
            return of(null);
          })
        )
        .subscribe();
    }
  }
}
