import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { loggedInGuard } from './logged-in.guard';

describe('loggedInGuard', () => {
  let authService: AuthService;
  let router: Router;
  let route: ActivatedRouteSnapshot;

  beforeEach(() => {
    authService = {
      isLoggedIn: vi.fn(),
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

  function runLoggedInGuard() {
    return TestBed.runInInjectionContext(() =>
      loggedInGuard(route, router.routerState.snapshot),
    );
  }

  it('should allow access when user is logged in', () => {
    (authService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const result = runLoggedInGuard();

    expect(result).toBe(true);
    expect(authService.isLoggedIn).toHaveBeenCalled();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to home when user is not logged in', () => {
    (authService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const result = runLoggedInGuard();

    expect(result).toEqual(router.createUrlTree(['']));
    expect(authService.isLoggedIn).toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['']);
  });
});
