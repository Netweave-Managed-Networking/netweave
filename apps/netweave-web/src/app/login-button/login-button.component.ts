import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login-button',
  standalone: true,
  imports: [RouterLink],
  styleUrls: ['./login-button.component.scss'],
  templateUrl: './login-button.component.html',
})
export class LoginButtonComponent {
  private auth = inject(AuthService);

  protected isLoggedIn = signal<boolean>(this.auth.isLoggedIn());

  protected logout() {
    this.auth.logout();
  }
}
