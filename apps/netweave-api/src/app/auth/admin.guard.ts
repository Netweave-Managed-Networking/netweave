import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * only allows access to route for authenticated users with the 'admin' role.
 *
 * @requires AuthGuard
 * - must be used together with AuthGuard (and after it), which populates req.user
 */
@Injectable()
export class AdminGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    if (req.user?.user.role !== 'admin') {
      throw new ForbiddenException('Admin role required');
    }

    return true;
  }
}
