import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, take, tap } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export const RESEND_COOLDOWN_SECONDS = 30;

type ResendState = 'idle' | 'pending' | 'sent' | 'error';

@Component({
  selector: 'app-register-confirm',
  imports: [RouterLink],
  templateUrl: './register-confirm.component.html',
  styleUrls: ['./register-confirm.component.scss'],
})
export class RegisterConfirmComponent {
  private auth = inject(AuthService);

  protected readonly email =
    inject(ActivatedRoute).snapshot.queryParamMap.get('email') ?? '';

  protected resendState = signal<ResendState>('idle');
  /** seconds until the resend button is enabled again, 0 when enabled */
  protected cooldown = signal(0);
  private cooldownInterval?: ReturnType<typeof setInterval>;

  public constructor() {
    // a mail was just sent by the registration, so resending is not possible right away
    this.startCooldown();
    inject(DestroyRef).onDestroy(() => clearInterval(this.cooldownInterval));
  }

  protected resend() {
    this.resendState.set('pending');

    this.auth
      .resendVerificationMail(this.email)
      .pipe(
        take(1),
        tap(() => this.resendState.set('sent')),
        catchError(() => (this.resendState.set('error'), of(null))),
      )
      .subscribe(() => this.startCooldown());
  }

  private startCooldown() {
    clearInterval(this.cooldownInterval);
    this.cooldown.set(RESEND_COOLDOWN_SECONDS);
    this.cooldownInterval = setInterval(() => {
      this.cooldown.update((seconds) => seconds - 1);
      if (this.cooldown() <= 0) clearInterval(this.cooldownInterval);
    }, 1000);
  }
}
