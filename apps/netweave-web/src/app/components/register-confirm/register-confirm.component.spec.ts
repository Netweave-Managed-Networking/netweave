import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import {
  RegisterConfirmComponent,
  RESEND_COOLDOWN_SECONDS,
} from './register-confirm.component';

describe('RegisterConfirmComponent', () => {
  let auth: { resendVerificationMail: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.useFakeTimers();
    auth = {
      resendVerificationMail: vi.fn().mockReturnValue(of({ success: true })),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterConfirmComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({ email: 'nb@example.com' }),
            },
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function create() {
    const fixture = TestBed.createComponent(RegisterConfirmComponent);
    fixture.detectChanges();
    return fixture;
  }

  function query<T extends HTMLElement>(
    fixture: ReturnType<typeof create>,
    selector: string,
  ): T {
    return fixture.nativeElement.querySelector(selector) as T;
  }

  function waitForCooldown(fixture: ReturnType<typeof create>) {
    vi.advanceTimersByTime(RESEND_COOLDOWN_SECONDS * 1000);
    fixture.detectChanges();
  }

  it('names the address the mail was sent to', () => {
    const fixture = create();

    expect(query(fixture, '.register-confirm__email').textContent).toContain(
      'nb@example.com',
    );
  });

  it('mentions the spam folder', () => {
    const fixture = create();

    expect(
      query(fixture, '.register-confirm__spam-hint').textContent,
    ).toContain('Spam');
  });

  it('links back to the registration with the email prefilled', () => {
    const fixture = create();

    expect(
      query(fixture, '.register-confirm__change-email').getAttribute('href'),
    ).toBe('/register?email=nb@example.com');
  });

  it('disables resending right after the registration mail was sent', () => {
    const fixture = create();
    const button = query<HTMLButtonElement>(
      fixture,
      '.register-confirm__resend',
    );

    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain(`${RESEND_COOLDOWN_SECONDS} s`);

    waitForCooldown(fixture);

    expect(button.disabled).toBe(false);
  });

  it('resends the mail and disables the button for the cooldown again', () => {
    const fixture = create();
    waitForCooldown(fixture);
    const button = query<HTMLButtonElement>(
      fixture,
      '.register-confirm__resend',
    );

    button.click();
    fixture.detectChanges();

    expect(auth.resendVerificationMail).toHaveBeenCalledWith('nb@example.com');
    expect(query(fixture, '.register-confirm__sent')).toBeTruthy();
    expect(button.disabled).toBe(true);

    vi.advanceTimersByTime((RESEND_COOLDOWN_SECONDS - 1) * 1000);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);

    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
  });

  it('shows an error when resending fails', () => {
    auth.resendVerificationMail.mockReturnValue(
      throwError(() => new Error('mail down')),
    );
    const fixture = create();
    waitForCooldown(fixture);

    query<HTMLButtonElement>(fixture, '.register-confirm__resend').click();
    fixture.detectChanges();

    expect(query(fixture, '.register-confirm__error')).toBeTruthy();
  });
});
