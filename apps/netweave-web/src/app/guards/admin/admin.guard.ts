import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const me = await firstValueFrom(auth.getMe());
  if (me === 'unauthenticated') return router.createUrlTree(['/login']);
  return me.user.role === 'admin' ? true : router.createUrlTree(['/home']);
};
