import { randomBytes } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvitationCreateDTO } from '@netweave/api-types';
import { Repository } from 'typeorm';
import { Invitation } from './invitation.entity';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  public constructor(
    @InjectRepository(Invitation)
    private repository: Repository<Invitation>,
  ) {
    this.logger.log(`InvitationsService initialized`);
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
}
