import { Component, signal } from '@angular/core';
import { IconMail, IconSettings } from '@netweave/icons';
import { MailSettingsComponent } from '../mail-settings/mail-settings.component';
import { UserInvitationsComponent } from '../user-invitations/user-invitations.component';

type SettingsTab = 'manager' | 'mail';

@Component({
  selector: 'app-settings',
  imports: [
    IconMail,
    IconSettings,
    UserInvitationsComponent,
    MailSettingsComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  protected activeTab = signal<SettingsTab>('manager');
}
