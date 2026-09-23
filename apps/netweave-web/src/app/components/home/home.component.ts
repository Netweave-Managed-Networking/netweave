import { Component } from '@angular/core';
import { DevInfosComponent } from '../dev-infos/dev-infos.component';
import { InviteParticipantComponent } from '../invite-participant/invite-participant.component';

@Component({
  selector: 'app-home',
  imports: [InviteParticipantComponent, DevInfosComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
