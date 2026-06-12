import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAuthDTO, UserDTO } from '@netweave/api-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../services/auth/auth.service';
import { UserMenuComponent } from './user-menu.component';

const mockUserAuthDTO: UserAuthDTO['user'] | 'unauthenticated' = {
  email: 'test@example.de',
  role: 'editor',
} as UserDTO;

describe('UserMenuComponent', () => {
  let fixture: ComponentFixture<UserMenuComponent>;
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
      imports: [UserMenuComponent],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();
  });

  it('should not show user avatar when the user is not logged in', () => {
    authServiceSpy.me.set('unauthenticated');
    fixture = TestBed.createComponent(UserMenuComponent);
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('.login-button__avatar');

    expect(avatar).toBeNull();
  });

  it('should render the users avatar and call logout when clicked', () => {
    authServiceSpy.me.set(mockUserAuthDTO);
    fixture = TestBed.createComponent(UserMenuComponent);
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
