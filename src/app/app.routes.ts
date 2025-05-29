import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'settings', // Or admin/settings, etc.
    loadChildren: () =>
      import('./settings/settings.module').then((m) => m.SettingsModule),
  },
];
