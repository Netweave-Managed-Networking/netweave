import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { MailModule } from './utils/mail.service/mail.module';

@Module({
  imports: [MailModule, OrganizationsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
