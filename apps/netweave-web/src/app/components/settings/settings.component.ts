import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { IconMail, IconSettings, IconSparkles } from '@netweave/icons';
import { LlmSettingsComponent } from '../llm-settings/llm-settings.component';
import { MailSettingsComponent } from '../mail-settings/mail-settings.component';
import { ManagerInvitationsComponent } from '../manager-invitations/manager-invitations.component';
import { UserRolesComponent } from '../user-roles/user-roles.component';

type SettingsTab = 'manager' | 'mail' | 'llm';

@Component({
  selector: 'app-settings',
  imports: [
    IconMail,
    IconSettings,
    IconSparkles,
    ManagerInvitationsComponent,
    UserRolesComponent,
    MailSettingsComponent,
    LlmSettingsComponent,
  ],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  protected activeTab = signal<SettingsTab>('manager');
}
