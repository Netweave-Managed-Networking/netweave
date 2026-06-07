import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserAuthDTO } from '@netweave/api-types';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../services/auth/auth.service';
import { adminGuard } from './admin.guard';

const mockAdminAuthDTO: UserAuthDTO = {
  sub: 1,
  user: { email: 'test@example.de', role: 'admin' },
};

const mockEditorAuthDTO: UserAuthDTO = {
  sub: 1,
  user: { email: 'test@example.de', role: 'editor' },
};

describe('adminGuard', () => {
  let authService: AuthService;
  let router: Router;
  let route: ActivatedRouteSnapshot;

  beforeEach(() => {
    authService = {
      // getMe(): Observable<UserAuthDTO | 'unauthenticated'> {
      getMe: vi.fn(),
    } as unknown as AuthService;

    router = {
      createUrlTree: vi.fn(),
      routerState: {
        snapshot: {},
      },
    } as unknown as Router;

    route = {
      routeConfig: {
        path: '',
      },
    } as unknown as ActivatedRouteSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function runAdminGuard() {
    return TestBed.runInInjectionContext(() =>
      adminGuard(route, router.routerState.snapshot),
    );
  }

  it('should allow access when user is logged in and an admin', async () => {
    (authService.getMe as ReturnType<typeof vi.fn>).mockReturnValue(
      of(mockAdminAuthDTO),
    );

    const result = await runAdminGuard();

    expect(result).toBe(true);
    expect(authService.getMe).toHaveBeenCalled();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to welcome-user when user is not an admin', async () => {
    (authService.getMe as ReturnType<typeof vi.fn>).mockReturnValue(
      of(mockEditorAuthDTO),
    );

    const result = await runAdminGuard();

    expect(result).toEqual(router.createUrlTree(['/welcome-user']));
    expect(authService.getMe).toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/welcome-user']);
  });

  it('should redirect to login when user is not logged in', async () => {
    (authService.getMe as ReturnType<typeof vi.fn>).mockReturnValue(
      of('unauthenticated'),
    );

    const result = await runAdminGuard();

    expect(result).toEqual(router.createUrlTree(['/login']));
    expect(authService.getMe).toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
