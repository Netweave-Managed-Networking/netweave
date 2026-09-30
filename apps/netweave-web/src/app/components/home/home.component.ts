import { Component } from '@angular/core';
import { DevInfosComponent } from '../dev-infos/dev-infos.component';
import { InviteParticipantComponent } from '../invite-participant/invite-participant.component';
import { MatchingRunComponent } from '../matching-run/matching-run.component';

@Component({
  selector: 'app-home',
  imports: [InviteParticipantComponent, MatchingRunComponent, DevInfosComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
