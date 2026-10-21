import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { InvitationCreateDTO, InvitationDTO } from '@netweave/api-types';
import { isEmail } from 'class-validator';

import { IconMail } from '@netweave/icons';
import { catchError, of, take, tap } from 'rxjs';
import { LoadingState } from '../../types/loading-state.type';

interface Feedback {
  type: 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-invite-participant',
  imports: [FormField, IconMail],
  templateUrl: './invite-participant.component.html',
})
export class InviteParticipantComponent {
  private http = inject(HttpClient);

  private loadingState = signal<LoadingState>('initial');
  protected feedback = signal<Feedback | null>(null);
  protected confirmed = signal(false);

  protected inviteModel = signal<{ email: string }>({ email: '' });

  protected inviteForm = form(this.inviteModel, (schemaPath) => {
    required(schemaPath.email);
    validate(schemaPath.email, ({ value }) =>
      isEmail(value())
        ? null
        : { kind: 'format', message: 'Ungültige Email-Adresse.' },
    );
  });

  protected openConfirmation(dialog: HTMLDialogElement) {
    if (this.inviteForm.email().errors().length > 0) return;

    this.feedback.set(null);
    this.confirmed.set(false);
    dialog.showModal();
  }

  protected cancel() {
    this.confirmed.set(false);
  }

  protected async submit(dialog: HTMLDialogElement) {
    if (!this.confirmed()) return;

    this.loadingState.set('pending');

    const invitationCreateDTO: InvitationCreateDTO = {
      email: this.inviteModel().email,
    };

    this.http
      .post<InvitationDTO>('/api/invitations', invitationCreateDTO)
      .pipe(
        take(1),
        tap(() => {
          this.loadingState.set('success');
          this.feedback.set({
            type: 'success',
            message: 'Die Einladung wurde gespeichert.',
          });
          this.resetForm();
        }),
        catchError(() => {
          this.loadingState.set('error');
          this.feedback.set({
            type: 'error',
            message: 'Die Einladung konnte nicht gespeichert werden.',
          });
          return of(null);
        }),
      )
      .subscribe();

    this.confirmed.set(false);
    dialog.close();
  }

  private resetForm() {
    this.inviteForm().reset({ email: '' });
  }
}
