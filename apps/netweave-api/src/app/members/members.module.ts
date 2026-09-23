import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsModule } from '../invitations/invitations.module';
import { MemberResourceRequirement } from './member-resource-requirement.entity';
import { Member } from './member.entity';
import { MemberController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, MemberResourceRequirement]),
    InvitationsModule,
  ],
  controllers: [MemberController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
