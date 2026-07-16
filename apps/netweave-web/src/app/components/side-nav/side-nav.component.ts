import { Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconHome, IconSettings } from '@netweave/icons';
import { HasRoleDirective } from '../../directives/has-role/has-role.directive';
import { HasSideNavId } from '../../interfaces/has-side-nav-id.interface';

@Component({
  selector: 'app-side-nav',
  imports: [IconHome, IconSettings, FormsModule, RouterLink, HasRoleDirective],
  templateUrl: './side-nav.component.html',
})
export class SideNavComponent implements HasSideNavId {
  public sideNavId = input.required<string>();
  protected isDrawerOpen = signal<boolean>(false);
}
