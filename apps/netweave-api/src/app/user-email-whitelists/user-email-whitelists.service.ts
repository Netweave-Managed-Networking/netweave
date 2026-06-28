import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { UserEmailWhitelistCreateDTO } from '@netweave/api-types';
import { Repository } from 'typeorm';
import { UserEmailWhitelist } from './user-email-whitelist.entity';

@Injectable()
export class UserEmailWhitelistsService {
  private readonly logger = new Logger(UserEmailWhitelistsService.name);

  public constructor(
    @InjectRepository(UserEmailWhitelist)
    private repository: Repository<UserEmailWhitelist>,
  ) {
    this.logger.log(`UserEmailWhitelistService initialized`);
  }

  public async all(): Promise<UserEmailWhitelist[] | null> {
    return await this.repository.find({
      relations: { createdBy: true },
      order: { emailOrDomain: 'asc' },
    });
  }

  public async save(
    dto: UserEmailWhitelistCreateDTO,
    creatorId: number,
  ): Promise<UserEmailWhitelist | null> {
    const createdBy = { id: creatorId };
    const entity = await this.repository.save({ ...dto, createdBy });

    return this.repository.findOne({
      where: { id: entity.id },
      relations: { createdBy: true },
    });
  }
}
