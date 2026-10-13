import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  InvitationTokenDTO,
  MemberDTO,
  MemberEmailConfirmationDTO,
  MemberUpsertDTO,
} from '@netweave/api-types';
import { InvitationsService } from '../invitations/invitations.service';
import { toInvitationTokenDTO } from './member-upsert-dto.mapper';
import { MembersService } from './members.service';

@Controller('members')
export class MemberController {
  public constructor(
    private readonly membersService: MembersService,
    private readonly invitationsService: InvitationsService,
  ) {}

  @Get('/latest')
  public async getLatest(): Promise<MemberDTO | null> {
    const member = await this.membersService.getLatestMember();
    if (!member) return null;

    // public endpoint: only the general data, never the emails
    const { id, name, contact, createdAt, updatedAt } = member;
    return { id, name, contact, createdAt, updatedAt };
  }

  @Put('by-token/:token')
  public async saveByToken(
    @Param('token') token: string,
    @Body() memberUpsertDTO: MemberUpsertDTO,
  ): Promise<InvitationTokenDTO> {
    const invitation = await this.invitationsService.findValidByToken(token);

    if (!invitation) {
      throw new NotFoundException();
    }

    const member = await this.membersService.saveForInvitation(
      invitation,
      memberUpsertDTO,
    );

    return toInvitationTokenDTO(invitation, member);
  }

  /** no auth: the link from the confirmation mail must work for whoever owns the new email */
  @Post('confirm-email')
  public async confirmEmail(
    @Body() dto: MemberEmailConfirmationDTO,
  ): Promise<{ success: true }> {
    await this.membersService.confirmEmailChangeOrFail(dto.token);
    return { success: true };
  }
}
