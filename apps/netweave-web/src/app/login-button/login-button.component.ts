import { Component, inject } from '@angular/core';
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

  protected authenticated = this.auth.authenticated;

  protected logout() {
    this.auth.logout();
  }
}
