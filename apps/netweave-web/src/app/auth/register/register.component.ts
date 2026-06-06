import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoadingState } from '../../shared/loading-state.type';
import {
  AuthFormComponent,
  AuthFormValue,
} from '../auth-form/auth-form.component';
import { AuthService } from '../auth.service';

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
