import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailerService } from '../../mailer/mailer.service';
import { MembersService } from '../../members/members.service';
import { QuoteService } from '../quote.service/quote.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  public constructor(
    private readonly mailerService: MailerService,
    private quoteService: QuoteService,
    private membersService: MembersService,
  ) {
    this.logger.log(`MailService initialized`);
  }

  @Cron(process.env.CRON_SCHEDULE_MAIL_SEND ?? '*/1 * * * *') // CRON_SCHEDULE_MAIL_SEND or default: every minute
  public async sendMail() {
    this.logger.log(`Trying to send Mail...`);

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

    return this.postMail();
  }

  private async postMail() {
    const deployInfo =
      process.env.NODE_ENV === 'development' ? 'local' : 'online';

    const quote = (await this.quoteService.getQuote())?.quote;
    const orgCount = await this.membersService.getMemberCount();
    const latestOrg = await this.membersService.getLatestMember();

    const sent = await this.mailerService.sendMail({
      to: process.env.MAIL_RECEIVER as string,
      subject: `Netweave (${deployInfo}): message from ${quote?.author ?? '<em>nobody</em>'}`,
      html: `
          <p>${quote?.quote ?? '<em>No message today.</em>'}</p>
          <p>${latestOrg ? `Latest member: ${latestOrg.name}` : 'No members found.'}</p>
          <p>Current member count: ${orgCount}.</p>
          <br />
          <p>Kind regards</p>
          <p>The Netweave Team</p>
          `,
    });

    if (!sent) {
      this.logger.error(`Failed to post mail`);
    }
  }
}
