import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  required,
  submit,
  TreeValidationResult,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export interface LoginFormValue {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  protected loginModel = signal<LoginFormValue>({ email: '', password: '' });

  protected loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Bitte gib deine Email ein.' });
    required(schemaPath.password, { message: 'Bitte gib dein Passwort ein.' });
  });

  protected readonly fields = [
    {
      id: 'login-email',
      label: 'Email',
      type: 'email',
      autocomplete: 'email',
      tree: this.loginForm.email,
    },
    {
      id: 'login-password',
      label: 'Passwort',
      type: 'password',
      autocomplete: 'current-password',
      tree: this.loginForm.password,
    },
  ] as const;

  protected onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, () => this.login());
  }

  private async login(): Promise<TreeValidationResult> {
    const { email, password } = this.loginModel();

    try {
      await firstValueFrom(this.auth.login(email, password));
      await this.router.navigate(['/']);
      return undefined;
    } catch (err) {
      const status = err instanceof HttpErrorResponse ? err.status : undefined;
      return {
        kind: 'server',
        message:
          status === HttpStatusCode.Unauthorized
            ? 'Email oder Passwort ist falsch.'
            : 'Anmeldung fehlgeschlagen. Bitte versuche es später erneut.',
      };
    }
  }
}
