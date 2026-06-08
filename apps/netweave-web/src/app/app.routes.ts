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
    path: 'welcome-user',
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import('./components/welcome-user/welcome-user.component').then(
        (m) => m.WelcomeUserComponent,
      ),
  },

  // TODO the current problem is that when reloading page on user-invitation page, it gets reset to welcome-user page
  // NEW OBSERVATION: this is because welcome-user is default (/ -> /welcome-user)
  //                  on reload I always land on default page
  // EVEN NEWER OBSERVATION: does only happen if Server side render (or prerender), not for client side rendering
  // EVEN NEWER OBSERVATION: does only happen if Server side render (or prerender) AND adminGuard are activated, does not happen for ssr without guard
  {
    path: 'user-invitation',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/user-invitation/user-invitation.component').then(
        (m) => m.UserInvitationComponent,
      ),
  },
  { path: '', redirectTo: 'welcome-user', pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
