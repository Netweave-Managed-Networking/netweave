import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { LoginComponent } from '../auth/login/login.component';
import { LoginButtonComponent } from './login-button.component';

describe('LoginButtonComponent', () => {
  let fixture: ComponentFixture<LoginButtonComponent>;
  let authServiceSpy: {
    isLoggedIn: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceSpy = {
      isLoggedIn: vi.fn(),
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
    authServiceSpy.isLoggedIn.mockReturnValue(false);
    fixture = TestBed.createComponent(LoginButtonComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');

    expect(button).toBeInstanceOf(HTMLButtonElement);
    expect(button.textContent?.trim()).toBe('Login');
    expect(authServiceSpy.logout).not.toHaveBeenCalled();
  });

  it('should render the logout button and call logout when clicked', () => {
    authServiceSpy.isLoggedIn.mockReturnValue(true);
    fixture = TestBed.createComponent(LoginButtonComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');

    expect(button).toBeInstanceOf(HTMLButtonElement);
    expect(button.textContent?.trim()).toBe('Logout');

    button.click();
    fixture.detectChanges();

    expect(authServiceSpy.logout).toHaveBeenCalledTimes(1);
  });
});
