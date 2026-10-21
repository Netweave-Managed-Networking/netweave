import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

/**
 * logs a user out client-side as soon as the backend rejects a request as
 * unauthenticated, e.g. because an admin removed their account while they
 * were still logged in.
 */
export const authExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      // only force a logout if we thought we were logged in - otherwise a failed
      // login attempt (also a 401) would redirect the user away from the login page
      const wasAuthenticated = authService.me() !== 'unauthenticated';

      if (
        wasAuthenticated &&
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        authService.me.set('unauthenticated');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
