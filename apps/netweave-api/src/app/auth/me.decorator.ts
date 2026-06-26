import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * retrieves logged in user if there is one
 *
 * @requires AuthGuard
 * - must be used together with AuthGuard to retrieve a logged in user
 * - if used without AuthGuard Me will be undefined no matter whether a user is logged in or not
 */
export const Me = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
