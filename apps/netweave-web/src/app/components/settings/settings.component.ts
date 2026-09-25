import { Component, signal } from '@angular/core';
import { IconMail, IconSettings } from '@netweave/icons';
import { MailSettingsComponent } from '../mail-settings/mail-settings.component';
import { MatchingRunComponent } from '../matching-run/matching-run.component';
import { UserInvitationsComponent } from '../user-invitations/user-invitations.component';
import { UserRolesComponent } from '../user-roles/user-roles.component';

type SettingsTab = 'manager' | 'mail' | 'matching';

@Component({
  selector: 'app-settings',
  imports: [
    IconMail,
    IconSettings,
    UserInvitationsComponent,
    UserRolesComponent,
    MailSettingsComponent,
    MatchingRunComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  protected activeTab = signal<SettingsTab>('manager');
}
