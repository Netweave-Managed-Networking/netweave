import { Routes } from '@angular/router';

import { adminGuard } from './guards/admin/admin.guard';
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
    canActivate: [unauthenticatedGuard],
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'home',
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'user-invitations',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/user-invitations/user-invitations.component').then(
        (m) => m.UserInvitationsComponent,
      ),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
