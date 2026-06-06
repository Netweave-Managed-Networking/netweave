import { Routes } from '@angular/router';

import { authenticatedGuard } from './guards/authenticated/authenticated.guard';
import { unauthenticatedGuard } from './guards/unauthenticated/unauthenticated.guard';

export const appRoutes: Routes = [
  {
    path: 'login',
    canActivate: [unauthenticatedGuard],
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'welcome-user',
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import('./components/welcome-user/welcome-user.component').then(
        (m) => m.WelcomeUserComponent,
      ),
  },
  { path: '', redirectTo: 'welcome-user', pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
