import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { InvitationsModule } from './invitations/invitations.module';
import { MailModule } from './mail/mail.module';
import { MatchingsModule } from './matchings/matchings.module';
import { MembersModule } from './members/members.module';
import { MemberUpdateRemindersModule } from './members/update-reminders/member-update-reminders.module';
import { UserEmailWhitelistsModule } from './user-email-whitelists/user-email-whitelists.module';
import { UsersModule } from './users/users.module';
import { SequentialTestMailerModule } from './utils/sequential-test-mailer.service/sequential-test-mailer.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    HealthCheckModule,
    InvitationsModule,
    MailModule,
    MatchingsModule,
    SequentialTestMailerModule,
    MembersModule,
    MemberUpdateRemindersModule,
    UserEmailWhitelistsModule,
    UsersModule,
  ],
})
export class AppModule {}
