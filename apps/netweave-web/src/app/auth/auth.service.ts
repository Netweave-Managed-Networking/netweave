import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, lastValueFrom, map, Observable, of, tap } from 'rxjs';

type AuthApiResponse = { success: true };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  public authenticated = signal<boolean>(false);

  public register(
    email: string,
    password: string,
  ): Observable<AuthApiResponse> {
    return this.http
      .post<AuthApiResponse>('/api/auth/register', { email, password })
      .pipe(tap(() => this.authenticated.set(true)));
  }

  public login(email: string, password: string): Observable<AuthApiResponse> {
    return this.http
      .post<AuthApiResponse>('/api/auth/login', { email, password })
      .pipe(tap(() => this.authenticated.set(true)));
  }

  public verifySession(): Observable<boolean> {
    return this.http.get<{ email: string }>('/api/auth/me').pipe(
      tap(() => this.authenticated.set(true)),
      map(() => true),
      catchError(() => {
        this.authenticated.set(false);
        return of(false);
      }),
    );
  }

  public async logout(): Promise<boolean> {
    await lastValueFrom(
      this.http.post<AuthApiResponse>('/api/auth/logout', {}),
    );
    this.authenticated.set(false);
    return this.router.navigate(['/login']);
  }
}
