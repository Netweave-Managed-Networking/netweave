import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '../../db/database.module';
import { MembersModule } from '../../members/members.module';
import { QuoteModule } from '../quote.service/quote.module';
import { MailService } from './mail.service';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    QuoteModule,
    MembersModule,
    DatabaseModule,
  ],
  providers: [MailService],
})
export class MailModule {}
