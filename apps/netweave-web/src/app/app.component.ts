import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SideNavComponent } from './components/side-nav/side-nav.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';

export const NETWEAVE_SIDE_NAV_ID = 'netweave-sidenav';

@Component({
  imports: [RouterModule, TopNavComponent, SideNavComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  public sideNavId = NETWEAVE_SIDE_NAV_ID;
}
