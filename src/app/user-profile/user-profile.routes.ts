import { Routes } from '@angular/router';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';

export const USER_PROFILE_ROUTES: Routes = [
  {
    path: 'me', // For the logged-in user's own profile
    component: ProfilePageComponent,
    data: { ownProfile: true }, // Pass data to indicate it's the user's own profile
    title: 'My Profile'
  },
  {
    path: ':username', // Route parameter for the username for public profiles
    component: ProfilePageComponent,
    data: { ownProfile: false },
    title: 'User Profile'
  }
];
