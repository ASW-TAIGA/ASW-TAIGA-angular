import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard'; // We'll create this guard

export const routes: Routes = [
  {
    path: 'users', // User selection page
    loadComponent: () => import('./auth/components/user-select/user-select.component').then(m => m.UserSelectComponent),
    title: 'Select User'
  },
  {
    path: 'issues',
    loadChildren: () => import('./issues-v2/issues.routes').then(m => m.ISSUES_ROUTES),
    canActivate: [AuthGuard] // Protect this route
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.routes').then(m => m.SETTINGS_ROUTES),
    canActivate: [AuthGuard] // Protect this route
  },
  {
    path: 'profile', 
    loadChildren: () => import('./user-profile/user-profile.routes').then(m => m.USER_PROFILE_ROUTES),
    canActivate: [AuthGuard] // Protect this route
  },
  {
    path: '',
    redirectTo: '/users', // Default to user selection page
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/users' // Fallback to user selection page
  }
];
