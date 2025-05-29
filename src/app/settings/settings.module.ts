// src/app/settings/settings.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './feature/settings/settings.component';

// No longer need to import or declare Angular Material modules
// All custom components are standalone and imported directly where used,
// or loaded via the router for feature components.

@NgModule({
  declarations: [
    // Standalone components (like StatusesAdminComponent, PrioritiesAdminComponent, etc.)
    // are imported directly where used or via the router, so they are NOT declared here.
    // SettingFormDialogComponent is also standalone and used in SettingAdminListComponent.
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    HttpClientModule, // For SettingsApiService (if you were using it; currently dummy data)
    ReactiveFormsModule, // For the forms we will build
    SettingsComponent, // Since SettingsComponent is standalone and serves as the root of this module's view
  ],
  // Providers for services will go here if needed later (e.g., SettingsApiService)
})
export class SettingsModule {}
