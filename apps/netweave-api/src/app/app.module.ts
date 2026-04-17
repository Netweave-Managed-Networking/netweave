import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { FetchService } from './utils/dummy-fetch/fetch.service';
import { MailService } from './utils/dummy-mail/mail.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    DatabaseModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, FetchService, MailService],
})
export class AppModule {}
