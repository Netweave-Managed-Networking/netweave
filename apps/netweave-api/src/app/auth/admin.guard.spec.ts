import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserAuthDTO } from '@netweave/api-types';
import { Request } from 'express';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

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

  beforeEach(() => {
    guard = new AdminGuard();
  });

  describe('canActivate', () => {
    it('returns true when the request user has the admin role', () => {
      const request: Partial<Request> = {
        user: { user: { role: 'admin' } } as unknown as UserAuthDTO,
      };
      const context = createMockExecutionContext(request);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('throws ForbiddenException when the request user is not an admin', () => {
      const request: Partial<Request> = {
        user: { user: { role: 'editor' } } as unknown as UserAuthDTO,
      };
      const context = createMockExecutionContext(request);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when there is no request user', () => {
      const request: Partial<Request> = {};
      const context = createMockExecutionContext(request);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
