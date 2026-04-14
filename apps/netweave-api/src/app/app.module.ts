import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FetchService } from './fetch.service';
import { MailService } from './mail.service';
import { OrganizationsModule } from './organizations/organizations.module';
import { TypeOrmDataSource } from './type-orm.data-source';

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
