import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export const unauthenticatedGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const me = await firstValueFrom(auth.getMe());
  const authenticated: boolean = me !== 'unauthenticated';
  return authenticated ? router.createUrlTree(['']) : true;
};
