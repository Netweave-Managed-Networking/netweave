import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss'],
})
export class LoginButtonComponent {
  private auth = inject(AuthService);

  protected authenticated = this.auth.me;

  protected logout() {
    this.auth.logout();
  }
}
