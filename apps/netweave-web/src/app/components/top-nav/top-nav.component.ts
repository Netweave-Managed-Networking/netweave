import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { IconSidebar } from '@netweave/icons';
import { HasSideNavId } from '../../interfaces/has-side-nav-id.interface';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-top-nav',
  imports: [UserMenuComponent, IconSidebar],
  templateUrl: './top-nav.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './top-nav.component.scss',
})
export class TopNavComponent implements HasSideNavId {
  public sideNavId = input.required<string>();
}
