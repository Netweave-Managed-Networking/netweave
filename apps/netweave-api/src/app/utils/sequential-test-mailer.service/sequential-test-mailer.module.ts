import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '../../db/database.module';
import { MailModule } from '../../mail/mail.module';
import { MembersModule } from '../../members/members.module';
import { QuoteModule } from '../quote.service/quote.module';
import { SequentialTestMailerService } from './sequential-test-mailer.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    QuoteModule,
    MembersModule,
    DatabaseModule,
    MailModule,
  ],
  providers: [SequentialTestMailerService],
})
export class SequentialTestMailerModule {}
