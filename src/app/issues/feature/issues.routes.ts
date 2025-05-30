import { Routes } from '@angular/router';

export const ISSUES_ROUTES: Routes = [
  {
    path: '', // Default path for /issues, e.g., displays the list of issues
    loadComponent: () =>
      import('./issues-list/issues-list.component').then(
        (m) => m.IssuesListComponent
      ),
    // We could add a title for the browser tab here if desired
    // title: 'Issues List - Ventus',
  },
  {
    path: ':id', // Path for viewing a specific issue, e.g., /issues/123
    loadComponent: () =>
      import('./issue-detail/issue-detail.component').then(
        (m) => m.IssueDetailComponent
      ),
    // Example of resolving data before the component loads,
    // and providing a dynamic title based on the issue.
    // title: (route) => `Issue #${route.paramMap.get('id')} - Ventus`,
    // resolve: {
    //   issue: () => import('./issue-detail/issue-detail.resolver').then(m => m.issueDetailResolver)
    // }
  },
  // If you plan to have a dedicated route for creating a new issue,
  // you could add it here, for example:
  // {
  //   path: 'new',
  //   loadComponent: () => import('./issue-form/issue-form.component').then(m => m.IssueFormComponent),
  //   title: 'New Issue - Ventus'
  // }
];
