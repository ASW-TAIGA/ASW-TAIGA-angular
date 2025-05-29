// src/app/settings/settings-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './feature/settings/settings.component';

// Import the actual feature components
import { StatusesAdminComponent } from './feature/settings/statuses-admin.component';
import { PrioritiesAdminComponent } from './feature/settings/priorities-admin.component';
import { SeveritiesAdminComponent } from './feature/settings/severities-admin.component';
import { IssueTypesAdminComponent } from './feature/settings/issue-types-admin.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      { path: '', redirectTo: 'statuses', pathMatch: 'full' },
      // Uncommented and using the actual components
      {
        path: 'statuses',
        component: StatusesAdminComponent,
        title: 'Status Settings',
      },
      {
        path: 'priorities',
        component: PrioritiesAdminComponent,
        title: 'Priority Settings',
      },
      {
        path: 'severities',
        component: SeveritiesAdminComponent,
        title: 'Severity Settings',
      },
      {
        path: 'issue-types',
        component: IssueTypesAdminComponent,
        title: 'Issue Type Settings',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
