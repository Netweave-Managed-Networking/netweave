import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  inject,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { form, FormField, required, validate } from '@angular/forms/signals';
import {
  DEFAULT_USER_ROLE,
  USER_ROLES,
  UserEmailWhitelistCreateDTO,
  UserEmailWhitelistDTO,
  UserRole,
} from '@netweave/api-types';
import { isDomain } from '@netweave/utils';
import { isEmail } from 'class-validator';

import { IconInfo, IconPlus } from '@netweave/icons';
import { catchError, of, take, tap } from 'rxjs';
import { LoadingState } from '../../types/loading-state.type';
import { USER_ROLE_LABELS } from '../../types/user-role-labels';

@Component({
  selector: 'app-user-invitation-create',
  imports: [FormField, IconInfo, IconPlus],
  templateUrl: './user-invitation-create.component.html',
  styleUrls: ['./user-invitation-create.component.scss'],
})
export class UserInvitationCreateComponent {
  private http = inject(HttpClient);
  private elementRef = inject(ElementRef);

  public entity = output<UserEmailWhitelistDTO>();
  private loadingState = signal<LoadingState>('initial');

  protected readonly roles = USER_ROLES;
  protected readonly roleLabels = USER_ROLE_LABELS;

  protected emailToAddModel = signal<{
    emailOrDomain: string;
    role: UserRole;
  }>({
    emailOrDomain: '',
    role: DEFAULT_USER_ROLE,
  });

  protected emailToAddForm = form(this.emailToAddModel, (schemaPath) => {
    required(schemaPath.emailOrDomain);
    validate(schemaPath.emailOrDomain, ({ value }) => {
      const isMail = this.emailToAddType() === 'email';
      if (isMail && isEmail(value())) return null;
      if (!isMail && isDomain(value())) return null;
      return {
        kind: 'type',
        message: `Ungültige ${isMail ? 'Email' : 'Domäne'}.`,
      };
    });
  });

  protected emailToAddType = linkedSignal<'email' | 'domain'>(() =>
    this.emailToAddForm.emailOrDomain().value().charAt(0) === '@'
      ? 'domain'
      : 'email',
  );

  protected cancel() {
    this.resetForm();
  }

  protected async submit(dialog: HTMLDialogElement) {
    this.loadingState.set('pending');

    const { emailOrDomain, role } = this.emailToAddModel();
    const userEmailWhitelistCreateDTO: UserEmailWhitelistCreateDTO = {
      emailOrDomain,
      role,
    };

    this.http
      .post<UserEmailWhitelistDTO>(
        '/api/user-email-whitelists',
        userEmailWhitelistCreateDTO,
      )
      .pipe(
        take(1),
        tap((item) => {
          this.entity.emit(item);
          this.loadingState.set('success');
        }),
        catchError(() => (this.loadingState.set('error'), of(null))),
      )
      .subscribe();

    this.resetForm();
    dialog.close();
  }

  protected toggleType(type: 'email' | 'domain') {
    this.emailToAddType.set(type);
  }

  private resetForm() {
    this.emailToAddForm().reset({
      emailOrDomain: '',
      role: DEFAULT_USER_ROLE,
    });
    this.emailToAddType.set('email');
  }
}
