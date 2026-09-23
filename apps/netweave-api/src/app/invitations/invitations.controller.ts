import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  InvitationCreateDTO,
  InvitationDTO,
  InvitationListItemDTO,
  InvitationTokenDTO,
  UserAuthDTO,
} from '@netweave/api-types';
import { AuthGuard } from '../auth/auth.guard';
import { Me } from '../auth/me.decorator';
import { toMemberUpsertDTO } from '../members/member-upsert-dto.mapper';
import { InvitationsService } from './invitations.service';

@Controller('invitations')
export class InvitationsController {
  public constructor(private readonly invitationsService: InvitationsService) {}

  @UseGuards(AuthGuard)
  @Get('')
  public async all(): Promise<InvitationListItemDTO[]> {
    return await this.invitationsService.all();
  }

  @Get('by-token/:token')
  public async findByToken(
    @Param('token') token: string,
  ): Promise<InvitationTokenDTO> {
    const invitation = await this.invitationsService.findValidByToken(token);

    if (!invitation) {
      throw new NotFoundException();
    }

    const { member } = invitation;

    return {
      email: invitation.email,
      member: member ? toMemberUpsertDTO(member) : null,
    };
  }

  @UseGuards(AuthGuard)
  @Post('')
  public async create(
    @Me() { user }: UserAuthDTO,
    @Body() invitationCreateDTO: InvitationCreateDTO,
  ): Promise<InvitationDTO | null> {
    return await this.invitationsService.save(invitationCreateDTO, user.id);
  }
}
