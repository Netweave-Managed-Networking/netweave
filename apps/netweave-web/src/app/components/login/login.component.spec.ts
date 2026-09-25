import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { UserAuthDTO, UserDTO } from '@netweave/api-types';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { LoginComponent } from './login.component';

const mockUserAuthDTO: UserAuthDTO = {
  sub: 1,
  user: { email: 'nb@example.com', role: 'viewer' } as UserDTO,
};

describe('LoginComponent', () => {
  let auth: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    auth = { login: vi.fn().mockReturnValue(of(mockUserAuthDTO)) };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    return fixture;
  }

  function fill(
    fixture: ReturnType<typeof create>,
    email: string,
    password: string,
  ) {
    const entries: [string, string][] = [
      ['login-email', email],
      ['login-password', password],
    ];
    for (const [id, value] of entries) {
      const el = fixture.nativeElement.querySelector(
        `#${id}`,
      ) as HTMLInputElement;
      el.value = value;
      el.dispatchEvent(new Event('input'));
    }
    fixture.detectChanges();
  }

  async function submitForm(fixture: ReturnType<typeof create>) {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function errorTexts(fixture: ReturnType<typeof create>): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        '.login__error, .login__form-error',
      ) as NodeListOf<HTMLElement>,
    ).map((el) => el.textContent?.trim() ?? '');
  }

  it('shows required errors for empty fields and does not log in', async () => {
    const fixture = create();

    await submitForm(fixture);

    expect(errorTexts(fixture)).toEqual([
      'Bitte gib deine Email ein.',
      'Bitte gib dein Passwort ein.',
    ]);
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('logs in and navigates home', async () => {
    const fixture = create();
    const navigate = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);
    fill(fixture, 'nb@example.com', 'password123');

    await submitForm(fixture);

    expect(auth.login).toHaveBeenCalledWith('nb@example.com', 'password123');
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('shows an error for invalid credentials', async () => {
    auth.login.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: HttpStatusCode.Unauthorized }),
      ),
    );
    const fixture = create();
    fill(fixture, 'nb@example.com', 'wrong-password');

    await submitForm(fixture);

    expect(errorTexts(fixture)).toEqual(['Email oder Passwort ist falsch.']);
  });
});
