import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

const COOKIE_NAME = 'nw_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  public register(email: string, password: string) {
    return this.http
      .post<{ access_token: string }>('/api/auth/register', { email, password })
      .pipe(tap((res) => this.saveToken(res.access_token)));
  }

  public login(email: string, password: string) {
    return this.http
      .post<{ access_token: string }>('/api/auth/login', { email, password })
      .pipe(tap((res) => this.saveToken(res.access_token)));
  }

  public logout() {
    this.deleteToken();
    this.router.navigate(['/login']);
  }

  public getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.parseCookie(COOKIE_NAME);
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private saveToken(token: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict${secureFlag}`;
  }

  private deleteToken() {
    if (!isPlatformBrowser(this.platformId)) return;
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  }

  private parseCookie(name: string): string | null {
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + name + '=([^;]*)'),
    );
    return match ? decodeURIComponent(match[1]) : null;
  }
}
