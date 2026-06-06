import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoadingState } from '../../shared/loading-state.type';
import {
  AuthFormComponent,
  AuthFormValue,
} from '../auth-form/auth-form.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AuthFormComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  protected loading = signal<LoadingState>('initial');
  protected error = signal<string | null>(null);

  protected onSubmit({ email, password }: AuthFormValue) {
    this.loading.set('loading');
    this.error.set(null);

    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading.set('success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set('error');
        this.error.set(err.error?.message ?? 'Login failed');
      },
    });
  }
}
