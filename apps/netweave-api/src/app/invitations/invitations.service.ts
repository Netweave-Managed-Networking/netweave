import { randomBytes } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  InvitationCreateDTO,
  InvitationDisplayStatus,
  InvitationListItemDTO,
} from '@netweave/api-types';
import { Repository } from 'typeorm';
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

  public async save(
    dto: InvitationCreateDTO,
    invitedById: number,
  ): Promise<Invitation | null> {
    const invitedBy = { id: invitedById };
    const token = randomBytes(32).toString('base64url');

    const entity = await this.repository.save({ ...dto, invitedBy, token });

    return this.repository.findOne({
      where: { id: entity.id },
      relations: { invitedBy: true },
    });
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
