import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailConfigDTO, MailConfigUpdateDTO } from '@netweave/api-types';
import { Repository } from 'typeorm';
import { encryptSecret } from './crypto.util';
import { MailConfig } from './mail-config.entity';
import { MailerService } from './mailer.service';

@Injectable()
export class MailConfigService {
  private readonly logger = new Logger(MailConfigService.name);

  public constructor(
    @InjectRepository(MailConfig)
    private readonly repository: Repository<MailConfig>,
    private readonly mailerService: MailerService,
  ) {
    this.logger.log(`MailConfigService initialized`);
  }

  public async get(): Promise<MailConfigDTO> {
    const row = await this.repository.findOne({
      where: {},
      order: { id: 'ASC' },
      select: {
        id: true,
        host: true,
        port: true,
        secure: true,
        authUser: true,
        authPassEncrypted: true,
        fromName: true,
        fromAddress: true,
        updatedAt: true,
      },
    });

    if (row) {
      return {
        host: row.host,
        port: row.port,
        secure: row.secure,
        authUser: row.authUser,
        hasPassword: !!row.authPassEncrypted,
        fromName: row.fromName,
        fromAddress: row.fromAddress,
        updatedAt: row.updatedAt,
      };
    }

    const effective = await this.mailerService.getEffectiveConfig();
    return {
      host: effective.host,
      port: effective.port,
      secure: effective.secure,
      authUser: effective.authUser ?? null,
      hasPassword: !!effective.authPass,
      fromName: effective.fromName,
      fromAddress: effective.fromAddress,
      updatedAt: null,
    };
  }

  public async update(
    dto: MailConfigUpdateDTO,
    updatedById: number,
  ): Promise<MailConfigDTO> {
    const existing = await this.repository.findOne({
      where: {},
      order: { id: 'ASC' },
      select: { id: true, authPassEncrypted: true },
    });

    const authPassEncrypted =
      dto.authPass === undefined
        ? (existing?.authPassEncrypted ?? null)
        : dto.authPass === ''
          ? null
          : encryptSecret(dto.authPass);

    await this.repository.save({
      id: existing?.id,
      host: dto.host,
      port: dto.port,
      secure: dto.secure,
      authUser: dto.authUser || null,
      authPassEncrypted,
      fromName: dto.fromName,
      fromAddress: dto.fromAddress,
      updatedBy: { id: updatedById },
    });

    this.mailerService.reload();

    return this.get();
  }
}
