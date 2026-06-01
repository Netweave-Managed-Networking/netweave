import { Routes } from '@angular/router';

import { loggedInGuard } from './auth/logged-in.guard';
import { loggedOutGuard } from './auth/logged-out.guard';

export const appRoutes: Routes = [
  {
    path: 'login',
    canActivate: [loggedOutGuard],
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'welcome-user',
    canActivate: [loggedInGuard],
    loadComponent: () =>
      import('./welcome-user/welcome-user.component').then(
        (m) => m.WelcomeUserComponent,
      ),
  },
  { path: '', redirectTo: 'welcome-user', pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
