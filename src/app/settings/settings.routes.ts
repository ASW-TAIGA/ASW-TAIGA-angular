import { Routes } from '@angular/router';
import { SettingsPageComponent } from './components/settings-page/settings-page.component';
// We'll create a generic list/form component or specific ones later
// For now, let's assume a generic settings list component that can be configured
import { SettingsListComponent } from './components/settings-list/settings-list.component';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: SettingsPageComponent,
    children: [
      { path: '', redirectTo: 'statuses', pathMatch: 'full' },
      {
        path: 'statuses',
        component: SettingsListComponent,
        data: { settingType: 'statuses', title: 'Statuses', itemLabel: 'Status', endpoint: '/settings/statuses/', formFields: ['name', 'color', 'order', 'is_closed'] },
        title: 'Manage Statuses'
      },
      {
        path: 'priorities',
        component: SettingsListComponent,
        data: { settingType: 'priorities', title: 'Priorities', itemLabel: 'Priority', endpoint: '/settings/priorities/', formFields: ['name', 'color', 'order'] },
        title: 'Manage Priorities'
      },
      {
        path: 'severities',
        component: SettingsListComponent,
        data: { settingType: 'severities', title: 'Severities', itemLabel: 'Severity', endpoint: '/settings/severities/', formFields: ['name', 'color', 'order'] },
        title: 'Manage Severities'
      },
      {
        path: 'types',
        component: SettingsListComponent,
        data: { settingType: 'types', title: 'Issue Types', itemLabel: 'Issue Type', endpoint: '/settings/types/', formFields: ['name', 'color', 'order'] },
        title: 'Manage Issue Types'
      }
      // Add routes for form components if they are separate (e.g., settings/:type/new, settings/:type/:id/edit)
      // For simplicity, the SettingsListComponent might handle showing a modal/inline form.
    ]
  }
];
