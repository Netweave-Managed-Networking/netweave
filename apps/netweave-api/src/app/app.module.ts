import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UserEmailWhitelistsModule } from './user-email-whitelists/user-email-whitelists.module';
import { MailModule } from './utils/mail.service/mail.module';

@Module({
  imports: [
    MailModule,
    OrganizationsModule,
    AuthModule,
    UserEmailWhitelistsModule,
  ],
})
export class AppModule {}
