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
    // link from the mail confirming a member's new email
    path: 'member-email-confirm/:token',
    loadComponent: () =>
      import(
        './components/member-email-confirm/member-email-confirm.component'
      ).then((m) => m.MemberEmailConfirmComponent),
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
        path: 'register/confirm',
        canActivate: [unauthenticatedGuard],
        loadComponent: () =>
          import(
            './components/register-confirm/register-confirm.component'
          ).then((m) => m.RegisterConfirmComponent),
      },
      {
        // no guard: the link from the confirmation mail must work regardless of who is logged in
        path: 'verify-email/:token',
        loadComponent: () =>
          import('./components/verify-email/verify-email.component').then(
            (m) => m.VerifyEmailComponent,
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
        path: 'members',
        canActivate: [authenticatedGuard],
        loadComponent: () =>
          import('./components/members/members.component').then(
            (m) => m.MembersComponent,
          ),
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
