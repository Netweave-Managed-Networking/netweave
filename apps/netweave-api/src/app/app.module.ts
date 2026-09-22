import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { InvitationsModule } from './invitations/invitations.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UserEmailWhitelistsModule } from './user-email-whitelists/user-email-whitelists.module';
import { MailModule } from './utils/mail.service/mail.module';

@Module({
  imports: [
    AuthModule,
    HealthCheckModule,
    InvitationsModule,
    MailModule,
    OrganizationsModule,
    UserEmailWhitelistsModule,
  ],
})
export class AppModule {}
