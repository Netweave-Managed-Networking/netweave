import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UserDTO } from '@netweave/api-types';
import { AuthService } from '../services/auth/auth.service';
import { authExpiredInterceptor } from './auth-expired.interceptor';

describe('authExpiredInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authExpiredInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('logs out and navigates to login on a 401 while authenticated', () => {
    authService.me.set({ email: 'editor@example.de' } as UserDTO);

    http.get('/api/members').subscribe({ error: () => undefined });

    httpMock
      .expectOne('/api/members')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(authService.me()).toBe('unauthenticated');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not navigate again when already unauthenticated', () => {
    http.get('/api/auth/me').subscribe({ error: () => undefined });

    httpMock
      .expectOne('/api/auth/me')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('does not navigate on non-401 errors', () => {
    authService.me.set({ email: 'editor@example.de' } as UserDTO);

    http.get('/api/members').subscribe({ error: () => undefined });

    httpMock
      .expectOne('/api/members')
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(authService.me()).not.toBe('unauthenticated');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
