import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { catchError, EMPTY, tap } from 'rxjs';
import { OrganizationsService } from '../../organizations/organizations.service';
import { QuoteService } from '../quote.service/quote.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly httpService: HttpService,
    private quoteService: QuoteService,
    private organizationsService: OrganizationsService,
  ) {
    this.logger.log(`MailService initialized`);
  }

  @Cron(process.env.CRON_SCHEDULE_MAIL_SEND ?? '*/1 * * * *') // CRON_SCHEDULE_MAIL_SEND or default: every minute
  public async sendMail() {
    this.logger.log(`Trying to send Mail...`);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not defined, aborting mail send');
      return;
    }

    const mailReceiverIsSet: boolean =
      process.env.MAIL_RECEIVER !== undefined &&
      process.env.MAIL_RECEIVER !== '';
    if (!mailReceiverIsSet) {
      this.logger.log('MAIL_RECEIVER is not set, mail will not be sent');
      return;
    }

    const sendMailActivated: boolean =
      process.env.SEND_MAIL_ACTIVATED === 'true';
    if (!sendMailActivated) {
      this.logger.log(
        'SEND_MAIL_ACTIVATED is not set to true, mail will not be sent',
      );
      return;
    }

    return this.postMail(apiKey);
  }

  private async postMail(apiKey: string) {
    const deployInfo =
      process.env.NODE_ENV === 'development' ? 'local' : 'online';

    const quote = (await this.quoteService.getQuote())?.quote;
    const orgCount = await this.organizationsService.getOrganizationCount();
    const latestOrg = await this.organizationsService.getLatestOrganization();

    return this.httpService
      .post(
        'https://api.resend.com/emails',
        {
          from: 'Netweave<info@netweave.de>',
          to: [process.env.MAIL_RECEIVER],
          subject: `Netweave (${deployInfo}): message from ${quote?.author ?? '<em>nobody</em>'}`,
          html: `
          <p>${quote?.quote ?? '<em>No message today.</em>'}</p>
          <p>${latestOrg ? `Latest organization: ${latestOrg.name}` : 'No organizations found.'}</p>
          <p>Current organization count: ${orgCount}.</p>
          <br />
          <p>Kind regards</p>
          <p>The Netweave Team</p>
          `,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      )
      .pipe(
        tap(() => this.logger.log(`Mail Post successfully`)),
        catchError((error) => {
          this.logger.error(`Failed to post mail: ${error.message}`);
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
