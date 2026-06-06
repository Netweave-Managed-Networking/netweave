import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserAuthDTO } from '@netweave/api-types';
import { catchError, lastValueFrom, Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  public me = signal<UserAuthDTO['user'] | 'unauthenticated'>(
    'unauthenticated',
  );

  public register(email: string, password: string): Observable<UserAuthDTO> {
    return this.http
      .post<UserAuthDTO>('/api/auth/register', { email, password })
      .pipe(tap(({ user }) => this.me.set(user)));
  }

  public login(email: string, password: string): Observable<UserAuthDTO> {
    return this.http
      .post<UserAuthDTO>('/api/auth/login', { email, password })
      .pipe(tap(({ user }) => this.me.set(user)));
  }

  public getMe(): Observable<UserAuthDTO | 'unauthenticated'> {
    return this.http.get<UserAuthDTO>('/api/auth/me').pipe(
      tap(({ user }) => this.me.set(user)),
      catchError((): Observable<'unauthenticated'> => {
        this.me.set('unauthenticated');
        return of('unauthenticated');
      }),
    );
  }

  public async logout(): Promise<boolean> {
    await lastValueFrom(this.http.post<UserAuthDTO>('/api/auth/logout', {}));
    this.me.set('unauthenticated');
    return this.router.navigate(['/login']);
  }
}
