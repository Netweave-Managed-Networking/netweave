import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  InvitationCreateDTO,
  InvitationDTO,
  InvitationListItemDTO,
  UserAuthDTO,
} from '@netweave/api-types';
import { AuthGuard } from '../auth/auth.guard';
import { Me } from '../auth/me.decorator';
import { InvitationsService } from './invitations.service';

@Controller('invitations')
export class InvitationsController {
  public constructor(private readonly invitationsService: InvitationsService) {}

  @UseGuards(AuthGuard)
  @Get('')
  public async all(): Promise<InvitationListItemDTO[]> {
    return await this.invitationsService.all();
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
