import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FetchService } from './fetch.service';
import { MailService } from './mail.service';
import { Organization } from './organizations/organization.entity';
import { OrganizationsModule } from './organizations/organizations.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    OrganizationsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DB,
      entities: [Organization],
      synchronize: true, // TODO: Set to false in production
    }),
  ],
  controllers: [AppController],
  providers: [AppService, FetchService, MailService],
})
export class AppModule {}
