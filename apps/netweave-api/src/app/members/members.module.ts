import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { InvitationsModule } from '../invitations/invitations.module';
import { MailModule } from '../mail/mail.module';
import { MemberCultureWeight } from './member-culture-weight.entity';
import { MemberResourceRequirement } from './member-resource-requirement.entity';
import { MemberViewOfEnvironmentAnswer } from './member-view-of-environment-answer.entity';
import { Member } from './member.entity';
import { MemberController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      MemberCultureWeight,
      MemberResourceRequirement,
      MemberViewOfEnvironmentAnswer,
    ]),
    AuthModule,
    InvitationsModule,
    MailModule,
  ],
  controllers: [MemberController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
