import { Routes } from '@angular/router';
import { UserSelectComponent } from './user-select/user-select.component';
import { authGuard } from '../guards/auth.guard'; // Import the guard

export const ACCOUNTS_ROUTES: Routes = [
  {
    path: 'select-user',
    component: UserSelectComponent,
    // title: 'Select User - Ventus'
  },
  {
    path: 'profile/me',
    loadComponent: () => import('./profile-page/profile-page.component').then(m => m.ProfilePageComponent),
    canActivate: [authGuard], // Protect this route
    // title: 'My Profile - Ventus'
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('./profile-page/profile-page.component').then(m => m.ProfilePageComponent),
    canActivate: [authGuard], // Protect this route as well
    // title: (route) => `${route.paramMap.get('username')}'s Profile - Ventus'`
  },
  {
    path: '',
    redirectTo: 'select-user',
    pathMatch: 'full',
  },
];
