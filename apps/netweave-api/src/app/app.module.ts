import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { InvitationsModule } from './invitations/invitations.module';
import { MembersModule } from './members/members.module';
import { UserEmailWhitelistsModule } from './user-email-whitelists/user-email-whitelists.module';
import { MailModule } from './utils/mail.service/mail.module';

@Module({
  imports: [
    AuthModule,
    HealthCheckModule,
    InvitationsModule,
    MailModule,
    MembersModule,
    UserEmailWhitelistsModule,
  ],
})
export class AppModule {}
