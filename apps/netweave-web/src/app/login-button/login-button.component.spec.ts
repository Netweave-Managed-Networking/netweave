import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserAuthDTO } from '@netweave/api-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { LoginComponent } from '../auth/login/login.component';
import { LoginButtonComponent } from './login-button.component';

const mockUserAuthDTO: UserAuthDTO['user'] | 'unauthenticated' = {
  email: 'test@example.de',
  role: 'editor',
};

describe('LoginButtonComponent', () => {
  let fixture: ComponentFixture<LoginButtonComponent>;
  let authServiceSpy: {
    me: WritableSignal<UserAuthDTO['user'] | 'unauthenticated'>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceSpy = {
      me: signal('unauthenticated'),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginButtonComponent],
      providers: [
        provideRouter([{ path: 'login', component: LoginComponent }]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();
  });

  it('should render the login button when the user is not logged in', () => {
    authServiceSpy.me.set('unauthenticated');
    fixture = TestBed.createComponent(LoginButtonComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.login-button__login');

    expect(button).toBeInstanceOf(HTMLAnchorElement);
    expect(button.textContent?.trim()).toBe('Anmelden');
    expect(authServiceSpy.logout).not.toHaveBeenCalled();
  });

  it('should render the users avatar and call logout when clicked', () => {
    authServiceSpy.me.set(mockUserAuthDTO);
    fixture = TestBed.createComponent(LoginButtonComponent);
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('.login-button__avatar');
    expect(avatar.textContent?.trim()).toBe('te'); // first two letters of email

    avatar.click();
    fixture.detectChanges();

    const logoutButton = fixture.nativeElement.querySelector(
      '.login-button__logout',
    );
    logoutButton.click();
    fixture.detectChanges();

    expect(authServiceSpy.logout).toHaveBeenCalledTimes(1);
  });
});
