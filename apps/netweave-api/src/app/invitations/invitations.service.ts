import { randomBytes } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  InvitationCreateDTO,
  InvitationDisplayStatus,
  InvitationListItemDTO,
  InvitationStatus,
} from '@netweave/api-types';
import { MoreThan, Repository } from 'typeorm';
import { MailerService } from '../mailer/mailer.service';
import { Invitation } from './invitation.entity';

const STATUS_ORDER: InvitationDisplayStatus[] = [
  'failed',
  'pending',
  'answered',
  'dispatched',
  'expired',
];

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  public constructor(
    @InjectRepository(Invitation)
    private repository: Repository<Invitation>,
    private readonly mailerService: MailerService,
  ) {
    this.logger.log(`InvitationsService initialized`);
  }

  public async all(): Promise<InvitationListItemDTO[]> {
    const invitations = await this.repository.find({
      order: { createdAt: 'DESC' },
    });

    return invitations
      .map((invitation) => ({
        id: invitation.id,
        email: invitation.email,
        status: this.toDisplayStatus(invitation),
        createdAt: invitation.createdAt,
      }))
      .sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
      );
  }

  /** returns the invitation for a token, or null if the token is unknown or expired */
  public async findValidByToken(token: string): Promise<Invitation | null> {
    return this.repository.findOne({
      where: { token, expireDate: MoreThan(new Date()) },
      relations: { member: true },
    });
  }

  public async save(
    dto: InvitationCreateDTO,
    invitedById: number,
  ): Promise<Invitation | null> {
    const invitedBy = { id: invitedById };
    const token = randomBytes(32).toString('base64url');

    const entity = await this.repository.save({ ...dto, invitedBy, token });

    const status = await this.dispatch(dto.email, token);
    await this.repository.update(entity.id, { status });

    return this.repository.findOne({
      where: { id: entity.id },
      relations: { invitedBy: true },
    });
  }

  /** sends the invitation mail and reports back whether it went out ('dispatched' or 'failed') */
  private async dispatch(
    email: string,
    token: string,
  ): Promise<InvitationStatus> {
    const link = `${process.env.WEB_APP_URL}/member-questions/${token}`;

    const sent = await this.mailerService.sendMail({
      to: email,
      subject: 'Einladung zu Netweave',
      html: `<p>Hallo,</p><p>du wurdest zu Netweave eingeladen. Über folgenden Link kannst du fortfahren:</p><p><a href="${link}">${link}</a></p>`,
    });

    return sent ? 'dispatched' : 'failed';
  }

  private toDisplayStatus(invitation: Invitation): InvitationDisplayStatus {
    if (invitation.answeredDate) return 'answered';

    if (invitation.status === 'pending' || invitation.status === 'dispatched') {
      return new Date(invitation.expireDate) < new Date()
        ? 'expired'
        : invitation.status;
    }

    return invitation.status as InvitationDisplayStatus;
  }
}
