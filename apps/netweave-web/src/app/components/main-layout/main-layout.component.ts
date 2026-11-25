import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SideNavComponent } from '../side-nav/side-nav.component';
import { TopNavComponent } from '../top-nav/top-nav.component';

export const NETWEAVE_SIDE_NAV_ID = 'netweave-sidenav';

@Component({
  imports: [RouterModule, TopNavComponent, SideNavComponent],
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  public sideNavId = NETWEAVE_SIDE_NAV_ID;
}
