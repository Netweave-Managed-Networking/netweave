import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../../mail/mail.module';
import { MemberUpdateReminder } from './member-update-reminder.entity';
import { MemberUpdateRemindersService } from './member-update-reminders.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberUpdateReminder]), MailModule],
  providers: [MemberUpdateRemindersService],
})
export class MemberUpdateRemindersModule {}
