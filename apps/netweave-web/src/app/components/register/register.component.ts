import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { LoadingState } from '../../types/loading-state.type';
import {
  AuthFormComponent,
  AuthFormValue,
} from '../auth-form/auth-form.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [AuthFormComponent, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  protected error = signal<string | null>(null);
  protected loading = signal<LoadingState>('initial');

  protected onSubmit({ email, password }: AuthFormValue) {
    this.loading.set('loading');
    this.error.set(null);

    this.auth.register(email, password).subscribe({
      next: () => {
        this.loading.set('success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set('error');
        this.error.set(err.error?.message ?? 'Registration failed');
      },
    });
  }
}
