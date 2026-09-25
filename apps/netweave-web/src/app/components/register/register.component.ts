import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  minLength,
  required,
  submit,
  TreeValidationResult,
  validate,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { isEmail } from 'class-validator';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export interface RegisterFormValue {
  email: string;
  password: string;
  passwordRepeat: string;
}

export const PASSWORD_MIN_LENGTH = 8;

@Component({
  selector: 'app-register',
  imports: [FormField, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  protected registerModel = signal<RegisterFormValue>({
    email: '',
    password: '',
    passwordRepeat: '',
  });

  protected registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Bitte gib deine Email ein.' });
    validate(schemaPath.email, ({ value }) =>
      !value() || isEmail(value())
        ? null
        : { kind: 'email', message: 'Ungültiges Email-Format.' },
    );

    required(schemaPath.password, { message: 'Bitte gib ein Passwort ein.' });
    minLength(schemaPath.password, PASSWORD_MIN_LENGTH, {
      message: `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`,
    });

    required(schemaPath.passwordRepeat, {
      message: 'Bitte wiederhole dein Passwort.',
    });
    validate(schemaPath.passwordRepeat, ({ value, valueOf }) =>
      !value() || value() === valueOf(schemaPath.password)
        ? null
        : {
            kind: 'passwordMismatch',
            message: 'Passwörter stimmen nicht überein.',
          },
    );
  });

  protected readonly fields = [
    {
      id: 'register-email',
      label: 'Email',
      type: 'email',
      autocomplete: 'email',
      placeholder: 'name@domain.com',
      tree: this.registerForm.email,
    },
    {
      id: 'register-password',
      label: 'Passwort',
      type: 'password',
      autocomplete: 'new-password',
      placeholder: `mind. ${PASSWORD_MIN_LENGTH} Zeichen`,
      tree: this.registerForm.password,
    },
    {
      id: 'register-password-repeat',
      label: 'Passwort wiederholen',
      type: 'password',
      autocomplete: 'new-password',
      placeholder: '',
      tree: this.registerForm.passwordRepeat,
    },
  ] as const;

  protected onSubmit(event: Event) {
    event.preventDefault();
    submit(this.registerForm, () => this.register());
  }

  private async register(): Promise<TreeValidationResult> {
    const { email, password } = this.registerModel();

    try {
      await firstValueFrom(this.auth.register(email, password));
      await this.router.navigate(['/']);
      return undefined;
    } catch (err) {
      return this.toSubmissionError(err);
    }
  }

  private toSubmissionError(err: unknown): TreeValidationResult {
    const status = err instanceof HttpErrorResponse ? err.status : undefined;

    if (status === HttpStatusCode.Conflict)
      return {
        kind: 'emailInUse',
        fieldTree: this.registerForm.email,
        message: 'Diese Email wird bereits verwendet.',
      };

    if (status === HttpStatusCode.Forbidden)
      return {
        kind: 'notWhitelisted',
        fieldTree: this.registerForm.email,
        message:
          'Diese Email bzw. Domäne ist nicht für die Registrierung freigeschaltet.',
      };

    return {
      kind: 'server',
      message: 'Registrierung fehlgeschlagen. Bitte versuche es später erneut.',
    };
  }
}
