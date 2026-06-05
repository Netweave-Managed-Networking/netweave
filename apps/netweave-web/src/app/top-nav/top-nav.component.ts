import { Component, input } from '@angular/core';
import { LoginButtonComponent } from '../login-button/login-button.component';

@Component({
  selector: 'app-top-nav',
  imports: [LoginButtonComponent],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.scss',
})
export class TopNavComponent {
  public welcomeText = input<string | undefined>(undefined);
}
