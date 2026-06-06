import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

export const loggedInGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const me = await firstValueFrom(auth.getMe());
  const authenticated: boolean = me !== 'unauthenticated';
  return authenticated ? true : router.createUrlTree(['/login']);
};
