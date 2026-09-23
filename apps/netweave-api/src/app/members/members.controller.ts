import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { MemberDTO, MemberUpsertDTO } from '@netweave/api-types';
import { InvitationsService } from '../invitations/invitations.service';
import { MembersService } from './members.service';

@Controller('members')
export class MemberController {
  public constructor(
    private readonly membersService: MembersService,
    private readonly invitationsService: InvitationsService,
  ) {}

  @Get('/latest')
  public getLatest(): Promise<MemberDTO | null> {
    return this.membersService.getLatestMember();
  }

  @Put('by-token/:token')
  public async saveByToken(
    @Param('token') token: string,
    @Body() memberUpsertDTO: MemberUpsertDTO,
  ): Promise<MemberUpsertDTO> {
    const invitation = await this.invitationsService.findValidByToken(token);

    if (!invitation) {
      throw new NotFoundException();
    }

    const member = await this.membersService.saveForInvitation(
      invitation.id,
      memberUpsertDTO,
    );

    return { name: member.name, contact: member.contact };
  }
}
