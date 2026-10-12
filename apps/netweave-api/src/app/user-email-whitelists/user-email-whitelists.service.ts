import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  UserEmailWhitelistCreateDTO,
  UserEmailWhitelistCreatedDTO,
  UserEmailWhitelistDTO,
} from '@netweave/api-types';
import { isDomain } from '@netweave/utils';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { UserEmailWhitelist } from './user-email-whitelist.entity';

@Injectable()
export class UserEmailWhitelistsService {
  private readonly logger = new Logger(UserEmailWhitelistsService.name);

  public constructor(
    @InjectRepository(UserEmailWhitelist)
    private repository: Repository<UserEmailWhitelist>,
    private readonly mailService: MailService,
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
  ): Promise<UserEmailWhitelistCreatedDTO | null> {
    const createdBy = { id: creatorId };
    const entity = await this.repository.save({ ...dto, createdBy });

    const invitationMailSent = isDomain(dto.emailOrDomain)
      ? null
      : await this.sendInvitation(dto.emailOrDomain);

    const created = await this.repository.findOne({
      where: { id: entity.id },
      relations: { createdBy: true },
    });

    return created && { ...created, invitationMailSent };
  }

  public async remove(id: UserEmailWhitelistDTO['id']): Promise<true> {
    const entity = await this.repository.findBy({ id });
    await this.repository.remove(entity);
    return true;
  }

  /** sends the registration invitation mail and reports back whether it went out */
  private async sendInvitation(email: string): Promise<boolean> {
    const link = `${process.env.WEB_APP_URL}/register`;

    return this.mailService.sendMail({
      to: email,
      subject: 'Einladung zur Registrierung bei Netweave',
      html: `<p>Hallo,</p><p>du wurdest als Netzwerkberater zu Netweave eingeladen. Über folgenden Link kannst du dich registrieren:</p><p><a href="${link}">${link}</a></p>`,
    });
  }
}
