import { Routes } from '@angular/router';
import { authGuard } from './accounts/guards/auth.guard'; // Import the guard

export const routes: Routes = [
  {
    path: 'accounts',
    loadChildren: () =>
      import('./accounts/feature/accounts.routes').then((m) => m.ACCOUNTS_ROUTES),
  },
  {
    path: 'issues',
    loadChildren: () =>
      import('./issues/feature/issues.routes').then((m) => m.ISSUES_ROUTES),
    canActivate: [authGuard] // Protect the issues route
  },
  {
    path: '',
    redirectTo: 'accounts/select-user', // Default to user selection
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'accounts/select-user', // Or a dedicated NotFoundComponent
  },
];
