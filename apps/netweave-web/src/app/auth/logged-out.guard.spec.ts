import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { loggedOutGuard } from './logged-out.guard';

describe('loggedOutGuard', () => {
  let authService: AuthService;
  let router: Router;
  let route: ActivatedRouteSnapshot;

  beforeEach(() => {
    authService = {
      authenticated: vi.fn(),
      verifySession: vi.fn(),
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

  function runLoggedOutGuard() {
    return TestBed.runInInjectionContext(() =>
      loggedOutGuard(route, router.routerState.snapshot),
    );
  }

  it('should allow access when user is logged out', async () => {
    (authService.verifySession as ReturnType<typeof vi.fn>).mockReturnValue(
      of(false),
    );

    const result = await runLoggedOutGuard();

    expect(result).toBe(true);
    expect(authService.verifySession).toHaveBeenCalled();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to home when user is logged in', async () => {
    (authService.verifySession as ReturnType<typeof vi.fn>).mockReturnValue(
      of(true),
    );

    const result = await runLoggedOutGuard();

    expect(result).toEqual(router.createUrlTree(['']));
    expect(authService.verifySession).toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['']);
  });
});
