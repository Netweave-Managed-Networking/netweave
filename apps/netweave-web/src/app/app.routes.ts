import { Routes } from '@angular/router';

import { adminGuard } from './guards/admin/admin.guard';
import { authenticatedGuard } from './guards/authenticated/authenticated.guard';
import { unauthenticatedGuard } from './guards/unauthenticated/unauthenticated.guard';

export const appRoutes: Routes = [
  {
    path: 'member-questions/:token',
    loadComponent: () =>
      import('./components/member-questions/member-questions.component').then(
        (m) => m.MemberQuestionsComponent,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
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
          import('./components/home/home.component').then(
            (m) => m.HomeComponent,
          ),
      },
      {
        path: 'member-invitations',
        canActivate: [authenticatedGuard],
        loadComponent: () =>
          import(
            './components/member-invitations/member-invitations.component'
          ).then((m) => m.MemberInvitationsComponent),
      },
      {
        path: 'matching-history',
        canActivate: [authenticatedGuard],
        loadComponent: () =>
          import(
            './components/matching-history/matching-history.component'
          ).then((m) => m.MatchingHistoryComponent),
      },
      {
        path: 'settings',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./components/settings/settings.component').then(
            (m) => m.SettingsComponent,
          ),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
