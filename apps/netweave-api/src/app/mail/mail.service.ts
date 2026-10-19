import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createTransport, Transporter } from 'nodemailer';
import { Repository } from 'typeorm';
import { decryptSecret } from './crypto.util';
import { MailConfig } from './mail-config.entity';

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

export interface EffectiveMailConfig {
  host: string;
  port: number;
  secure: boolean;
  authUser?: string;
  authPass?: string;
  fromName: string;
  fromAddress: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  public constructor(
    @InjectRepository(MailConfig)
    private readonly repository: Repository<MailConfig>,
  ) {
    this.logger.log(`MailService initialized`);
  }

  public async sendMail({
    to,
    subject,
    html,
  }: SendMailInput): Promise<boolean> {
    try {
      const config = await this.getEffectiveConfig();
      const transporter = this.createTransporter(config);

      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromAddress}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Mail sent to ${to}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send mail to ${to}: ${message}`);
      return false;
    }
  }

  public async sendTestMail(to: string): Promise<boolean> {
    return this.sendMail({
      to,
      subject: 'Netweave: Test-E-Mail',
      html: '<p>Dies ist eine Test-E-Mail der Netweave Mail-Konfiguration.</p>',
    });
  }

  /**
   * DB row (if an admin has ever saved one) takes precedence over env vars, so
   * a runtime config change survives a container restart without touching .env.
   */
  public async getEffectiveConfig(): Promise<EffectiveMailConfig> {
    const row = await this.repository.findOne({
      where: {},
      order: { id: 'ASC' },
      // authPassEncrypted is `select: false` on the entity; list it explicitly to read it back
      select: {
        id: true,
        host: true,
        port: true,
        secure: true,
        authUser: true,
        authPassEncrypted: true,
        fromName: true,
        fromAddress: true,
      },
    });

    if (row) {
      return {
        host: row.host,
        port: row.port,
        secure: row.secure,
        authUser: row.authUser ?? undefined,
        authPass: row.authPassEncrypted
          ? decryptSecret(row.authPassEncrypted)
          : undefined,
        fromName: row.fromName,
        fromAddress: row.fromAddress,
      };
    }

    return {
      host: process.env.SMTP_HOST ?? 'localhost',
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: process.env.SMTP_SECURE === 'true',
      authUser: process.env.SMTP_USER || undefined,
      authPass: process.env.SMTP_PASSWORD || undefined,
      fromName: process.env.MAIL_FROM_NAME ?? 'Netweave',
      fromAddress: process.env.MAIL_FROM_ADDRESS ?? 'info@netweave.de',
    };
  }

  private createTransporter(config: EffectiveMailConfig): Transporter {
    return createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.authUser
        ? { user: config.authUser, pass: config.authPass }
        : undefined,
    });
  }
}
