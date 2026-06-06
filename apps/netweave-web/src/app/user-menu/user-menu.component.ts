import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent {
  private auth = inject(AuthService);

  protected authenticated = this.auth.me;

  protected logout() {
    this.auth.logout();
  }
}
