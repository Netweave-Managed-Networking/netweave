import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmDataSource } from './db/type-orm.data-source';
import { OrganizationsModule } from './organizations/organizations.module';
import { FetchService } from './utils/dummy-fetch/fetch.service';
import { MailService } from './utils/dummy-mail/mail.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    OrganizationsModule,
    TypeOrmModule.forRoot(TypeOrmDataSource.options),
  ],
  controllers: [AppController],
  providers: [AppService, FetchService, MailService],
})
export class AppModule {}
