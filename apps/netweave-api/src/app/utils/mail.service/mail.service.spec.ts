import { MailerService } from '../../mailer/mailer.service';
import { MembersService } from '../../members/members.service';
import { QuoteService } from '../quote.service/quote.service';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  let mailerService: jest.Mocked<Pick<MailerService, 'sendMail'>>;
  let quoteService: jest.Mocked<Pick<QuoteService, 'getQuote'>>;
  let membersService: jest.Mocked<
    Pick<MembersService, 'getMemberCount' | 'getLatestMember'>
  >;

  const originalEnv = process.env;

  beforeEach(() => {
    mailerService = { sendMail: jest.fn().mockResolvedValue(true) };
    quoteService = {
      getQuote: jest
        .fn()
        .mockResolvedValue({ quote: { quote: 'Stay hungry.', author: 'X' } }),
    };
    membersService = {
      getMemberCount: jest.fn().mockResolvedValue(3),
      getLatestMember: jest.fn().mockResolvedValue({ name: 'Acme' }),
    };

    service = new MailService(
      mailerService as unknown as MailerService,
      quoteService as unknown as QuoteService,
      membersService as unknown as MembersService,
    );

    process.env = { ...originalEnv };
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('sendMail', () => {
    it('does not send when MAIL_RECEIVER is unset', async () => {
      process.env.MAIL_RECEIVER = '';
      process.env.SEND_MAIL_ACTIVATED = 'true';

      await service.sendMail();

      expect(mailerService.sendMail).not.toHaveBeenCalled();
    });

    it('does not send when SEND_MAIL_ACTIVATED is not true', async () => {
      process.env.MAIL_RECEIVER = 'team@example.com';
      process.env.SEND_MAIL_ACTIVATED = 'false';

      await service.sendMail();

      expect(mailerService.sendMail).not.toHaveBeenCalled();
    });

    it('sends the quote/member digest via MailerService when enabled and configured', async () => {
      process.env.MAIL_RECEIVER = 'team@example.com';
      process.env.SEND_MAIL_ACTIVATED = 'true';

      await service.sendMail();

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      const call = mailerService.sendMail.mock.calls[0][0];
      expect(call.to).toBe('team@example.com');
      expect(call.html).toContain('Stay hungry.');
      expect(call.html).toContain('Acme');
    });
  });
});
