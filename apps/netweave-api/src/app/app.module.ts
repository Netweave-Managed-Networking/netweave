import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { InvitationsModule } from './invitations/invitations.module';
import { MailerModule } from './mailer/mailer.module';
import { MembersModule } from './members/members.module';
import { UserEmailWhitelistsModule } from './user-email-whitelists/user-email-whitelists.module';
import { SequentialTestMailerModule } from './utils/sequential-test-mailer.service/sequential-test-mailer.module';

@Module({
  imports: [
    AuthModule,
    HealthCheckModule,
    InvitationsModule,
    MailerModule,
    SequentialTestMailerModule,
    MembersModule,
    UserEmailWhitelistsModule,
  ],
})
export class AppModule {}
