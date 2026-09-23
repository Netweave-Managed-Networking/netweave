import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { InvitationsModule } from './invitations/invitations.module';
import { MailModule } from './mail/mail.module';
import { MembersModule } from './members/members.module';
import { UserEmailWhitelistsModule } from './user-email-whitelists/user-email-whitelists.module';
import { SequentialTestMailerModule } from './utils/sequential-test-mailer.service/sequential-test-mailer.module';

@Module({
  imports: [
    AuthModule,
    HealthCheckModule,
    InvitationsModule,
    MailModule,
    SequentialTestMailerModule,
    MembersModule,
    UserEmailWhitelistsModule,
  ],
})
export class AppModule {}
