import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { UserAuthDTO, UserDTO } from '@netweave/api-types';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterComponent } from './register.component';

const mockUserAuthDTO: UserAuthDTO = {
  sub: 1,
  user: { email: 'nb@example.com', role: 'viewer' } as UserDTO,
};

describe('RegisterComponent', () => {
  let auth: { register: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    auth = { register: vi.fn().mockReturnValue(of(mockUserAuthDTO)) };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    return fixture;
  }

  function input(fixture: ReturnType<typeof create>, id: string) {
    return fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
  }

  function fill(
    fixture: ReturnType<typeof create>,
    values: { email: string; password: string; passwordRepeat: string },
  ) {
    const entries: [string, string][] = [
      ['register-email', values.email],
      ['register-password', values.password],
      ['register-password-repeat', values.passwordRepeat],
    ];
    for (const [id, value] of entries) {
      const el = input(fixture, id);
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
        '.register__error, .register__form-error',
      ) as NodeListOf<HTMLElement>,
    ).map((el) => el.textContent?.trim() ?? '');
  }

  it('renders email, password and password repeat inputs and a Registrieren button', () => {
    const fixture = create();

    expect(input(fixture, 'register-email')).toBeTruthy();
    expect(input(fixture, 'register-password').type).toBe('password');
    expect(input(fixture, 'register-password-repeat').type).toBe('password');
    expect(
      fixture.nativeElement.querySelector('.register__submit').textContent,
    ).toContain('Registrieren');
  });

  it('shows required errors for empty fields on submit and does not register', async () => {
    const fixture = create();

    await submitForm(fixture);

    expect(errorTexts(fixture)).toEqual([
      'Bitte gib deine Email ein.',
      'Bitte gib ein Passwort ein.',
      'Bitte wiederhole dein Passwort.',
    ]);
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('shows an error for an invalid email format', async () => {
    const fixture = create();
    fill(fixture, {
      email: 'not-an-email',
      password: 'password123',
      passwordRepeat: 'password123',
    });

    await submitForm(fixture);

    expect(errorTexts(fixture)).toEqual(['Ungültiges Email-Format.']);
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('shows an error when the passwords do not match', async () => {
    const fixture = create();
    fill(fixture, {
      email: 'nb@example.com',
      password: 'password123',
      passwordRepeat: 'password124',
    });

    await submitForm(fixture);

    expect(errorTexts(fixture)).toEqual(['Passwörter stimmen nicht überein.']);
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('registers and navigates home on valid input', async () => {
    const fixture = create();
    const navigate = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);
    fill(fixture, {
      email: 'nb@example.com',
      password: 'password123',
      passwordRepeat: 'password123',
    });

    await submitForm(fixture);

    expect(auth.register).toHaveBeenCalledWith('nb@example.com', 'password123');
    expect(navigate).toHaveBeenCalledWith(['/']);
    expect(errorTexts(fixture)).toEqual([]);
  });

  it.each([
    [HttpStatusCode.Conflict, 'Diese Email wird bereits verwendet.'],
    [
      HttpStatusCode.Forbidden,
      'Diese Email bzw. Domäne ist nicht für die Registrierung freigeschaltet.',
    ],
    [
      HttpStatusCode.InternalServerError,
      'Registrierung fehlgeschlagen. Bitte versuche es später erneut.',
    ],
  ])('shows the server error for status %s', async (status, message) => {
    auth.register.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status })),
    );
    const fixture = create();
    fill(fixture, {
      email: 'nb@example.com',
      password: 'password123',
      passwordRepeat: 'password123',
    });

    await submitForm(fixture);

    expect(errorTexts(fixture)).toEqual([message]);
  });
});
