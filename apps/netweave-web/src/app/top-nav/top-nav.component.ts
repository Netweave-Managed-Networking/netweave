import { Component, input } from '@angular/core';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-top-nav',
  imports: [UserMenuComponent],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.scss',
})
export class TopNavComponent {
  public welcomeText = input<string | undefined>(undefined);
}
