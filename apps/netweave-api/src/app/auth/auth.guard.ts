import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

/**
 * only allows access to route for authenticated users. retrieves logged in user from request cookie.
 *
 * - can be used together with MeDecorator, then the logged in user can be accessed in controller if needed.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly authService: AuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    req.user = await this.authService.getAuthUserFromCookieOrFail(
      req.headers.cookie,
    );
    return true;
  }
}
