import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthDTO } from '@netweave/api-types';
import { Request } from 'express';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jest.Mocked<AuthService>;

  const createMockExecutionContext = (
    request: Partial<Request>,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: {
            getAuthUserFromCookieOrFail: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    authService = module.get(AuthService);

    // The guard logs to the console; silence it so test output stays clean.
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canActivate', () => {
    it('calls authService.getAuthUserFromCookieOrFail with the cookie header', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      authService.getAuthUserFromCookieOrFail.mockResolvedValue(
        mockUser as unknown as UserAuthDTO,
      );

      const request: Partial<Request> = {
        headers: { cookie: 'sessionId=abc123' },
      };
      const context = createMockExecutionContext(request);

      await guard.canActivate(context);

      expect(authService.getAuthUserFromCookieOrFail).toHaveBeenCalledWith(
        'sessionId=abc123',
      );
      expect(authService.getAuthUserFromCookieOrFail).toHaveBeenCalledTimes(1);
    });

    it('attaches the resolved user to req.user', async () => {
      const mockUser = { id: '42', email: 'jane@example.com' };
      authService.getAuthUserFromCookieOrFail.mockResolvedValue(
        mockUser as unknown as UserAuthDTO,
      );

      const request: Partial<Request> = {
        headers: { cookie: 'sessionId=abc123' },
      };
      const context = createMockExecutionContext(request);

      await guard.canActivate(context);

      expect(request.user).toEqual(mockUser);
    });

    it('returns true when authentication succeeds', async () => {
      authService.getAuthUserFromCookieOrFail.mockResolvedValue({
        id: '1',
      } as unknown as UserAuthDTO);

      const request: Partial<Request> = {
        headers: { cookie: 'sessionId=abc123' },
      };
      const context = createMockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('still returns true when no user is resolved (undefined)', async () => {
      authService.getAuthUserFromCookieOrFail.mockResolvedValue(
        undefined as unknown as UserAuthDTO,
      );

      const request: Partial<Request> = { headers: {} };
      const context = createMockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toBeUndefined();
    });

    it('passes undefined to authService when there is no cookie header', async () => {
      authService.getAuthUserFromCookieOrFail.mockResolvedValue(
        undefined as unknown as UserAuthDTO,
      );

      const request: Partial<Request> = { headers: {} };
      const context = createMockExecutionContext(request);

      await guard.canActivate(context);

      expect(authService.getAuthUserFromCookieOrFail).toHaveBeenCalledWith(
        undefined,
      );
    });

    it('propagates errors thrown by authService.getAuthUserFromCookieOrFail', async () => {
      const error = new Error('Invalid session');
      authService.getAuthUserFromCookieOrFail.mockRejectedValue(error);

      const request: Partial<Request> = {
        headers: { cookie: 'sessionId=bad' },
      };
      const context = createMockExecutionContext(request);

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid session',
      );
      // req.user should never be set if the service call rejects
      expect(request.user).toBeUndefined();
    });

    it('retrieves the request via context.switchToHttp().getRequest()', async () => {
      authService.getAuthUserFromCookieOrFail.mockResolvedValue({
        id: '1',
      } as unknown as UserAuthDTO);

      const request: Partial<Request> = {
        headers: { cookie: 'sessionId=abc123' },
      };
      const getRequest = jest.fn().mockReturnValue(request);
      const context = {
        switchToHttp: () => ({
          getRequest,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
      } as unknown as ExecutionContext;

      await guard.canActivate(context);

      expect(getRequest).toHaveBeenCalledTimes(1);
    });
  });
});
