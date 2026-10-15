import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Optional,
  Param,
  Post,
  Put,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  GeneratedRequirementsDTO,
  InvitationTokenDTO,
  MemberDTO,
  MemberEmailConfirmationDTO,
  MemberRequirementsGenerationDTO,
  MemberUpsertDTO,
} from '@netweave/api-types';
import { InvitationsService } from '../invitations/invitations.service';
import { toInvitationTokenDTO } from './member-upsert-dto.mapper';
import { MembersService } from './members.service';
import {
  REQUIREMENTS_GENERATOR,
  RequirementsGenerator,
} from './requirements-generation/requirements-generator';
import { RateLimiter } from './requirements-generation/rate-limiter';

/** each generation is a paid llm call */
export const REQUIREMENTS_GENERATION_LIMIT = {
  calls: 10,
  windowMs: 60 * 60 * 1000,
};

@Controller('members')
export class MemberController {
  private readonly logger = new Logger(MemberController.name);
  private readonly generationLimiter = new RateLimiter(
    REQUIREMENTS_GENERATION_LIMIT.calls,
    REQUIREMENTS_GENERATION_LIMIT.windowMs,
  );

  public constructor(
    private readonly membersService: MembersService,
    private readonly invitationsService: InvitationsService,
    // null without LLM_PROVIDER, which nest only accepts for optional dependencies
    @Optional()
    @Inject(REQUIREMENTS_GENERATOR)
    private readonly requirementsGenerator: RequirementsGenerator | null,
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

  /** nothing is stored, the member adds the generated requirements in the questionnaire and saves them */
  @Post('by-token/:token/generated-requirements')
  @HttpCode(HttpStatus.OK)
  public async generateRequirements(
    @Param('token') token: string,
    @Body() dto: MemberRequirementsGenerationDTO,
  ): Promise<GeneratedRequirementsDTO> {
    const invitation = await this.invitationsService.findValidByToken(token);

    if (!invitation) {
      throw new NotFoundException();
    }

    if (!this.requirementsGenerator) {
      throw new ServiceUnavailableException('No LLM_PROVIDER configured');
    }

    if (!this.generationLimiter.tryAcquire(invitation.id)) {
      throw new HttpException(
        'Too many requirement generations, try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    try {
      return await this.requirementsGenerator.generate(dto.projectDescription);
    } catch (err) {
      // the description itself is not logged, it may contain internals of the organization
      this.logger.error(
        `Generating requirements for invitation ${invitation.id} failed: ${err instanceof Error ? err.message : err}`,
      );
      throw new BadGatewayException('Generating requirements failed');
    }
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
