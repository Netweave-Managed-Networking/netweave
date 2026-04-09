import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { tap } from 'rxjs';
import { LogEntry } from './fetch.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly httpService: HttpService) {
    this.logger.log(`MailService initialized`);
  }

  @Cron(process.env.CRON_SCHEDULE_MAIL_SEND ?? '*/1 * * * *') // CRON_SCHEDULE_MAIL_SEND or default: every minute
  public async sendMail() {
    this.logger.log(`Trying to send Mail...`);

    // read last entry and log it
    const lastEntry = await this.readLastLineFromFile();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not defined, aborting mail send');
      return;
    }

    return this.httpService
      .post(
        'https://api.resend.com/emails',
        {
          from: 'Netweave<info@netweave.de>',
          to: ['marvinfrede@gmx.de'],
          subject: `Netweave: message from ${lastEntry.data.author}`,
          html: `<p>${lastEntry.data.quote}</p>`,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      )
      .pipe(tap(() => this.logger.log(`Mail Post successfully`)))
      .subscribe();
  }

  private async readLastLineFromFile(): Promise<LogEntry> {
    const filePath = join('./response-log.txt');
    const contents = await readFile(filePath, 'utf-8');
    const lines = contents.trim().split(/\r?\n/);
    const last = lines.pop() || '';
    if (!last) {
      throw new Error('log file is empty');
    }
    return JSON.parse(last) as LogEntry;
  }
}
