import { HttpInterceptorFn } from '@angular/common/http';
import { inject, REQUEST } from '@angular/core';

/**
 * this interceptor makes sure that for server side rendered pages (see app.routes.server.ts) the cookie is present
 */
export const ssrCookieInterceptor: HttpInterceptorFn = (req, next) => {
  const request = inject(REQUEST, { optional: true });
  if (!request) return next(req);

  const cookie = request.headers.get('cookie');
  if (!cookie) return next(req);

  return next(req.clone({ setHeaders: { Cookie: cookie } }));
};
