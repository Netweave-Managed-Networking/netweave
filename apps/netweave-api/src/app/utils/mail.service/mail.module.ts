import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '../../db/database.module';
import { MailerModule } from '../../mailer/mailer.module';
import { MembersModule } from '../../members/members.module';
import { QuoteModule } from '../quote.service/quote.module';
import { MailService } from './mail.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    QuoteModule,
    MembersModule,
    DatabaseModule,
    MailerModule,
  ],
  providers: [MailService],
})
export class MailModule {}
