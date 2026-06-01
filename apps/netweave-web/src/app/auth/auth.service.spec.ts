import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

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
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    document.cookie = '';
  });

  afterEach(() => {
    httpMock.verify();
    document.cookie = '';
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register and save token cookie', () => {
    const response = { access_token: 'register-token' };

    service.register('test@example.com', 'password').subscribe((res) => {
      expect(res).toEqual(response);
      expect(document.cookie).toContain('nw_token=register-token');
    });

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      password: 'password',
    });
    req.flush(response);
  });

  it('should login and save token cookie', () => {
    const response = { access_token: 'login-token' };

    service.login('user@example.com', 'password').subscribe((res) => {
      expect(res).toEqual(response);
      expect(document.cookie).toContain('nw_token=login-token');
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'user@example.com',
      password: 'password',
    });
    req.flush(response);
  });

  it('should return token from cookie on browser platform', () => {
    document.cookie = 'nw_token=abc123; path=/;';

    expect(service.getToken()).toBe('abc123');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return null when not running in browser', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const serverService = TestBed.inject(AuthService);
    expect(serverService.getToken()).toBeNull();
    expect(serverService.isLoggedIn()).toBe(false);
  });

  it('should clear token and navigate to login on logout', () => {
    document.cookie = 'nw_token=delete-me; path=/;';

    service.logout();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(service.isLoggedIn()).toBe(false);
  });
});
