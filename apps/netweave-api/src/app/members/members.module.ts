import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsModule } from '../invitations/invitations.module';
import { MemberCultureWeight } from './member-culture-weight.entity';
import { MemberResourceRequirement } from './member-resource-requirement.entity';
import { Member } from './member.entity';
import { MemberController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      MemberCultureWeight,
      MemberResourceRequirement,
    ]),
    InvitationsModule,
  ],
  controllers: [MemberController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
