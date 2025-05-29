import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './feature/settings/settings.component';

// Import UI modules if you're using something like Angular Material
// For example:
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatListModule } from '@angular/material/list';
// import { MatButtonModule } from '@angular/material/button';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatIconModule } from '@angular/material/icon';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatTableModule } from '@angular/material/table';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatSelectModule } from '@angular/material/select';
// import { DragDropModule } from '@angular/cdk/drag-drop';

// Placeholder declarations for components we'll create:
// import { StatusesAdminComponent } from './statuses-admin/statuses-admin.component';
// import { PrioritiesAdminComponent } from './priorities-admin/priorities-admin.component';
// import { SeveritiesAdminComponent } from './severities-admin/severities-admin.component';
// import { IssueTypesAdminComponent } from './issue-types-admin/issue-types-admin.component';
// import { SettingFormDialogComponent } from './setting-form-dialog/setting-form-dialog.component';

@NgModule({
  declarations: [
    // StatusesAdminComponent,
    // PrioritiesAdminComponent,
    // SeveritiesAdminComponent,
    // IssueTypesAdminComponent,
    // SettingFormDialogComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    HttpClientModule, // For SettingsApiService
    ReactiveFormsModule, // For the forms we will build
    SettingsComponent,

    // Add any Angular Material (or other UI library) modules here
    // MatTabsModule,
    // MatListModule,
  ],
})
export class SettingsModule {}
