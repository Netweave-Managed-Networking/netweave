import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDTO } from '@netweave/api-types';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from '../../services/auth/auth.service';
import { HasRoleDirective } from './has-role.directive';

const mockAdmin: UserDTO = {
  email: 'admin@example.com',
  role: 'admin',
} as UserDTO;

const mockEditor: UserDTO = {
  email: 'editor@example.com',
  role: 'editor',
} as UserDTO;

const mockViewer: UserDTO = {
  email: 'viewer@example.com',
  role: 'viewer',
} as UserDTO;

@Component({
  template: `<div *appHasRole="requiredRole" class="protected">
    Protected content
  </div>`,
  standalone: true,
  imports: [HasRoleDirective],
})
class TestHostComponent {
  public requiredRole: UserDTO['role'] = 'admin';
}

describe('HasRoleDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let authService: AuthService;

  beforeEach(async () => {
    authService = {
      me: signal<'unauthenticated' | UserDTO>('unauthenticated'),
    } as unknown as AuthService;

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  const queryProtected = () =>
    fixture.nativeElement.querySelector('.protected') as HTMLElement | null;

  it('should not render when the user is unauthenticated', () => {
    fixture.detectChanges();
    expect(queryProtected()).toBeNull();
  });

  it('should render when the user has the required single role', () => {
    authService.me.set(mockAdmin);
    fixture.detectChanges();
    expect(queryProtected()?.textContent).toContain('Protected content');
  });

  it('should hide when the user does not have the required single role', () => {
    authService.me.set(mockEditor);
    fixture.detectChanges();
    expect(queryProtected()).toBeNull();
  });

  it('should render when admin satisfies a required editor role', () => {
    authService.me.set(mockAdmin);
    host.requiredRole = 'editor';
    fixture.detectChanges();
    expect(queryProtected()).not.toBeNull();
  });

  it('should render when admin satisfies a required viewer role', () => {
    authService.me.set(mockAdmin);
    host.requiredRole = 'viewer';
    fixture.detectChanges();
    expect(queryProtected()).not.toBeNull();
  });

  it('should render when editor satisfies a required viewer role', () => {
    authService.me.set(mockEditor);
    host.requiredRole = 'viewer';
    fixture.detectChanges();
    expect(queryProtected()).not.toBeNull();
  });

  it('should hide when viewer does not satisfy a required editor role', () => {
    authService.me.set(mockViewer);
    host.requiredRole = 'editor';
    fixture.detectChanges();
    expect(queryProtected()).toBeNull();
  });

  it('should hide when the required role array does not contain the user role', () => {
    host.requiredRole = 'admin';
    authService.me.set(mockEditor);
    fixture.detectChanges();
    expect(queryProtected()).toBeNull();
  });

  it('should update visibility when the auth state changes after initial render', () => {
    authService.me.set(mockAdmin);
    fixture.detectChanges();
    expect(queryProtected()).not.toBeNull();

    authService.me.set('unauthenticated');
    fixture.detectChanges();
    expect(queryProtected()).toBeNull();
  });
});
