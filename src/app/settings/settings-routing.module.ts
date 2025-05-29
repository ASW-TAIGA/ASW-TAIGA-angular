import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './feature/settings/settings.component';

// Placeholders for components we'll create soon
// import { StatusesAdminComponent } from './statuses-admin/statuses-admin.component';
// import { PrioritiesAdminComponent } from './priorities-admin/priorities-admin.component';
// import { SeveritiesAdminComponent } from './severities-admin/severities-admin.component';
// import { IssueTypesAdminComponent } from './issue-types-admin/issue-types-admin.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      { path: '', redirectTo: 'statuses', pathMatch: 'full' },
      // { path: 'statuses', component: StatusesAdminComponent, title: 'Status Settings' },
      // { path: 'priorities', component: PrioritiesAdminComponent, title: 'Priority Settings' },
      // { path: 'severities', component: SeveritiesAdminComponent, title: 'Severity Settings' },
      // { path: 'issue-types', component: IssueTypesAdminComponent, title: 'Issue Type Settings' }
      // We will uncomment and use the actual components once they are created.
      // For now, to avoid errors, these lines are commented out.
      // You can add simple placeholder components if you want to test routing immediately.
      { path: 'statuses', children: [], title: 'Status Settings' }, // Placeholder
      { path: 'priorities', children: [], title: 'Priority Settings' }, // Placeholder
      { path: 'severities', children: [], title: 'Severity Settings' }, // Placeholder
      { path: 'issue-types', children: [], title: 'Issue Type Settings' }, // Placeholder
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
