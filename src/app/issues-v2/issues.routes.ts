import { Routes } from '@angular/router';
import { IssueListComponent } from './components/issue-list/issue-list.component';
import { IssueDetailComponent } from './components/issue-detail/issue-detail.component';
import { IssueFormComponent } from './components/issue-form/issue-form.component';
import { IssueBulkCreateComponent } from './components/issue-bulk-create/issue-bulk-create.component';

export const ISSUES_ROUTES: Routes = [
  {
    path: '',
    component: IssueListComponent,
    title: 'Issues'
  },
  {
    path: 'new',
    component: IssueFormComponent,
    title: 'New Issue'
  },
  {
    path: 'bulk-create',
    component: IssueBulkCreateComponent,
    title: 'Bulk Create Issues'
  },
  {
    path: ':id',
    component: IssueDetailComponent,
    title: 'Issue Details'
  },
  {
    path: ':id/edit',
    component: IssueFormComponent,
    title: 'Edit Issue'
  }
];
