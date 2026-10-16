import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  InvitationTokenDTO,
  MemberDTO,
  MemberEmailConfirmationDTO,
  MemberListItemDTO,
  MemberUpsertDTO,
  PaginatedDTO,
} from '@netweave/api-types';
import { AuthGuard } from '../auth/auth.guard';
import { InvitationsService } from '../invitations/invitations.service';
import { toInvitationTokenDTO } from './member-upsert-dto.mapper';
import { MembersService } from './members.service';

const DEFAULT_LIST_PAGE_SIZE = 20;

@Controller('members')
export class MemberController {
  public constructor(
    private readonly membersService: MembersService,
    private readonly invitationsService: InvitationsService,
  ) {}

  /** member overview, by name, paginated, optionally narrowed down by a search on name and email */
  @UseGuards(AuthGuard)
  @Get('')
  public async getPage(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(DEFAULT_LIST_PAGE_SIZE),
      ParseIntPipe,
    )
    pageSize: number,
    @Query('search', new DefaultValuePipe('')) search: string,
  ): Promise<PaginatedDTO<MemberListItemDTO>> {
    return this.membersService.getPage(page, pageSize, search);
  }

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
