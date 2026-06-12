import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UserAuthDTO, UserDTO } from '@netweave/api-types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

const mockUserAuthDTO: UserAuthDTO = {
  sub: 123,
  user: { email: 'test@example.de', role: 'editor' } as UserDTO,
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register and mark authenticated', () => {
    const response = mockUserAuthDTO;

    service
      .register(mockUserAuthDTO.user.email, 'password')
      .subscribe((res) => {
        expect(res).toEqual(response);
        expect(service.me()).toBe(mockUserAuthDTO.user);
      });

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: mockUserAuthDTO.user.email,
      password: 'password',
    });
    req.flush(response);
  });

  it('should login and mark authenticated', () => {
    const response = mockUserAuthDTO;

    service.login(mockUserAuthDTO.user.email, 'password').subscribe((res) => {
      expect(res).toEqual(response);
      expect(service.me()).toBe(mockUserAuthDTO.user);
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: mockUserAuthDTO.user.email,
      password: 'password',
    });
    req.flush(response);
  });

  it('should be logged out by default', () => {
    expect(service.me()).toBe('unauthenticated');
  });

  it('should verify session and mark authenticated', () => {
    const response = mockUserAuthDTO;

    service.getMe().subscribe((me) => {
      expect(me).toBe(mockUserAuthDTO);
      expect(service.me()).toBe(mockUserAuthDTO.user);
    });

    const req = httpMock.expectOne('/api/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should treat a failed session verification as logged out', () => {
    service.getMe().subscribe((me) => {
      expect(me).toBe('unauthenticated');
      expect(service.me()).toBe('unauthenticated');
    });

    const req = httpMock.expectOne('/api/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });
  });

  it('should clear authentication and navigate to login on logout', async () => {
    service.me.set(mockUserAuthDTO.user);

    const logoutPromise = service.logout();
    const req = httpMock.expectOne('/api/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
    await logoutPromise;

    expect(service.me()).toBe('unauthenticated');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
