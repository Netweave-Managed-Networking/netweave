import { createTransport } from 'nodemailer';
import { Repository } from 'typeorm';
import { encryptSecret } from './crypto.util';
import { MailConfig } from './mail-config.entity';
import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

const createTransportMock = createTransport as jest.Mock;
const sendMailMock = jest.fn();

type MockRepo = Partial<Record<keyof Repository<MailConfig>, jest.Mock>>;

const createMockRepository = (): MockRepo => ({
  findOne: jest.fn(),
});

describe('MailService', () => {
  let service: MailService;
  let repository: MockRepo;

  const originalEnv = process.env;

  beforeEach(() => {
    repository = createMockRepository();
    service = new MailService(repository as unknown as Repository<MailConfig>);

    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test_jwt_secret',
      SMTP_HOST: 'localhost',
      SMTP_PORT: '1025',
      SMTP_SECURE: 'false',
      SMTP_USER: '',
      SMTP_PASSWORD: '',
      MAIL_FROM_NAME: 'Netweave',
      MAIL_FROM_ADDRESS: 'info@netweave.de',
    };

    createTransportMock.mockReturnValue({ sendMail: sendMailMock });

    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('getEffectiveConfig', () => {
    it('falls back to env vars when there is no DB row', async () => {
      repository.findOne?.mockResolvedValue(null);

      const config = await service.getEffectiveConfig();

      expect(config).toEqual({
        host: 'localhost',
        port: 1025,
        secure: false,
        authUser: undefined,
        authPass: undefined,
        fromName: 'Netweave',
        fromAddress: 'info@netweave.de',
      });
    });

    it('uses the DB row (decrypted) when one exists', async () => {
      const encrypted = encryptSecret('super-secret');
      repository.findOne?.mockResolvedValue({
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        authUser: 'smtp-user',
        authPassEncrypted: encrypted,
        fromName: 'Custom Sender',
        fromAddress: 'custom@example.com',
      });

      const config = await service.getEffectiveConfig();

      expect(config).toEqual({
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        authUser: 'smtp-user',
        authPass: 'super-secret',
        fromName: 'Custom Sender',
        fromAddress: 'custom@example.com',
      });
    });
  });

  describe('sendMail', () => {
    it('builds a transporter from the effective config and sends the mail', async () => {
      repository.findOne?.mockResolvedValue(null);
      sendMailMock.mockResolvedValue(undefined);

      const result = await service.sendMail({
        to: 'nt@example.com',
        subject: 'Hallo',
        html: '<p>Hallo</p>',
      });

      expect(result).toBe(true);
      expect(createTransportMock).toHaveBeenCalledWith({
        host: 'localhost',
        port: 1025,
        secure: false,
        auth: undefined,
      });
      expect(sendMailMock).toHaveBeenCalledWith({
        from: '"Netweave" <info@netweave.de>',
        to: 'nt@example.com',
        subject: 'Hallo',
        html: '<p>Hallo</p>',
      });
    });

    it('returns false and does not throw when sending fails', async () => {
      repository.findOne?.mockResolvedValue(null);
      sendMailMock.mockRejectedValue(new Error('connection refused'));

      const result = await service.sendMail({
        to: 'nt@example.com',
        subject: 'Hallo',
        html: '<p>Hallo</p>',
      });

      expect(result).toBe(false);
    });

    it('reuses the cached transporter across calls until reload() is invoked', async () => {
      repository.findOne?.mockResolvedValue(null);
      sendMailMock.mockResolvedValue(undefined);

      await service.sendMail({ to: 'a@example.com', subject: 's', html: 'h' });
      await service.sendMail({ to: 'b@example.com', subject: 's', html: 'h' });
      expect(createTransportMock).toHaveBeenCalledTimes(1);

      service.reload();
      await service.sendMail({ to: 'c@example.com', subject: 's', html: 'h' });
      expect(createTransportMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendTestMail', () => {
    it('sends a fixed test subject/body to the given address', async () => {
      repository.findOne?.mockResolvedValue(null);
      sendMailMock.mockResolvedValue(undefined);

      const result = await service.sendTestMail('admin@example.com');

      expect(result).toBe(true);
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'admin@example.com' }),
      );
    });
  });
});
