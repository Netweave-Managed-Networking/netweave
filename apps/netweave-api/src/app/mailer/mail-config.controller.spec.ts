import { Test, TestingModule } from '@nestjs/testing';
import {
  MailConfigDTO,
  MailConfigUpdateDTO,
  UserAuthDTO,
  UserDTO,
} from '@netweave/api-types';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { MailConfigController } from './mail-config.controller';
import { MailConfigService } from './mail-config.service';
import { MailerService } from './mailer.service';

const mockUser: UserDTO = {
  id: 7,
  email: 'admin@example.de',
  role: 'admin',
} as UserDTO;

const mockAuthUser: UserAuthDTO = {
  sub: 7,
  user: mockUser,
};

const mockConfig: MailConfigDTO = {
  host: 'smtp.example.com',
  port: 587,
  secure: true,
  authUser: 'smtp-user',
  hasPassword: true,
  fromName: 'Netweave',
  fromAddress: 'info@netweave.de',
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('MailConfigController', () => {
  let controller: MailConfigController;
  let mailConfigService: Partial<Record<'get' | 'update', jest.Mock>>;
  let mailerService: Partial<Record<'sendTestMail', jest.Mock>>;

  beforeEach(async () => {
    mailConfigService = {
      get: jest.fn().mockResolvedValue(mockConfig),
      update: jest.fn().mockResolvedValue(mockConfig),
    };
    mailerService = {
      sendTestMail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailConfigController],
      providers: [
        { provide: MailConfigService, useValue: mailConfigService },
        { provide: MailerService, useValue: mailerService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<MailConfigController>(MailConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('returns the config from the service', async () => {
      const result = await controller.get();

      expect(mailConfigService.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockConfig);
    });
  });

  describe('update', () => {
    it('updates the config using the service with the current user id', async () => {
      const dto: MailConfigUpdateDTO = {
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        authUser: 'smtp-user',
        authPass: 'secret',
        fromName: 'Netweave',
        fromAddress: 'info@netweave.de',
      };

      const result = await controller.update(mockAuthUser, dto);

      expect(mailConfigService.update).toHaveBeenCalledWith(
        dto,
        mockAuthUser.user.id,
      );
      expect(result).toEqual(mockConfig);
    });
  });

  describe('test', () => {
    it('sends a test mail via MailerService and reports success', async () => {
      const result = await controller.test({ to: 'someone@example.com' });

      expect(mailerService.sendTestMail).toHaveBeenCalledWith(
        'someone@example.com',
      );
      expect(result).toEqual({ success: true });
    });

    it('reports failure when the test mail could not be sent', async () => {
      mailerService.sendTestMail?.mockResolvedValueOnce(false);

      const result = await controller.test({ to: 'someone@example.com' });

      expect(result).toEqual({ success: false });
    });
  });
});
