import { HttpClient } from '@angular/common/http';
import {
  Component,
  effect,
  inject,
  resource,
  ResourceRef,
  signal,
} from '@angular/core';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { MailConfigDTO, MailConfigUpdateDTO } from '@netweave/api-types';
import { isEmail } from 'class-validator';
import { catchError, firstValueFrom, of, take, tap } from 'rxjs';
import { LoadingState } from '../../types/loading-state.type';

interface MailSettingsFormModel {
  host: string;
  port: number;
  secure: boolean;
  noAuth: boolean;
  authUser: string;
  authPass: string;
  fromName: string;
  fromAddress: string;
}

const EMPTY_MODEL: MailSettingsFormModel = {
  host: '',
  port: 587,
  secure: true,
  noAuth: false,
  authUser: '',
  authPass: '',
  fromName: 'Netweave',
  fromAddress: '',
};

@Component({
  selector: 'app-mail-settings',
  imports: [FormField],
  templateUrl: './mail-settings.component.html',
  styleUrls: ['./mail-settings.component.scss'],
})
export class MailSettingsComponent {
  private http = inject(HttpClient);

  protected saveState = signal<LoadingState>('initial');
  protected testState = signal<LoadingState>('initial');
  protected testRecipient = signal('');
  protected hasPassword = signal(false);

  protected settingsModel = signal<MailSettingsFormModel>(EMPTY_MODEL);

  protected settingsResource: ResourceRef<MailConfigDTO | null | undefined> =
    resource({
      loader: () =>
        firstValueFrom(
          this.http
            .get<MailConfigDTO>('/api/mail-config')
            .pipe(catchError(() => of(null))),
        ),
    });

  protected settingsForm = form(this.settingsModel, (schemaPath) => {
    required(schemaPath.host);
    required(schemaPath.fromName);

    validate(schemaPath.fromAddress, ({ value }) =>
      isEmail(value())
        ? null
        : { kind: 'format', message: 'Ungültige Email-Adresse.' },
    );

    validate(schemaPath.port, ({ value }) =>
      value() >= 1 && value() <= 65535
        ? null
        : { kind: 'range', message: 'Port muss zwischen 1 und 65535 liegen.' },
    );
  });

  public constructor() {
    effect(() => {
      const config = this.settingsResource.value();
      if (!config) return;

      this.hasPassword.set(config.hasPassword);
      this.settingsModel.set({
        host: config.host,
        port: config.port,
        secure: config.secure,
        noAuth: !config.authUser,
        authUser: config.authUser ?? '',
        authPass: '',
        fromName: config.fromName,
        fromAddress: config.fromAddress,
      });
    });
  }

  protected async submit() {
    if (this.settingsForm().errors().length > 0) return;

    this.saveState.set('pending');
    const model = this.settingsModel();

    // noAuth clears any stored credentials; otherwise an empty password field
    // means "keep the current password" (see MailConfigUpdateDTO.authPass)
    const dto: MailConfigUpdateDTO = {
      host: model.host,
      port: Number(model.port),
      secure: model.secure,
      authUser: model.noAuth ? undefined : model.authUser || undefined,
      authPass: model.noAuth ? '' : model.authPass || undefined,
      fromName: model.fromName,
      fromAddress: model.fromAddress,
    };

    this.http
      .put<MailConfigDTO>('/api/mail-config', dto)
      .pipe(
        take(1),
        tap((config) => {
          this.saveState.set('success');
          this.hasPassword.set(config.hasPassword);
          this.settingsModel.update((current) => ({
            ...current,
            authPass: '',
          }));
        }),
        catchError(() => {
          this.saveState.set('error');
          return of(null);
        }),
      )
      .subscribe();
  }

  protected async sendTestMail() {
    const to = this.testRecipient();
    if (!isEmail(to)) return;

    this.testState.set('pending');

    this.http
      .post<{ success: boolean }>('/api/mail-config/test', { to })
      .pipe(
        take(1),
        tap(({ success }) => this.testState.set(success ? 'success' : 'error')),
        catchError(() => {
          this.testState.set('error');
          return of(null);
        }),
      )
      .subscribe();
  }
}
