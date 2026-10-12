import { UserEmailWhitelistCreateDTO } from '@netweave/api-types';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { UserEmailWhitelist } from './user-email-whitelist.entity';
import { UserEmailWhitelistsService } from './user-email-whitelists.service';

type MockRepo = Partial<
  Record<keyof Repository<UserEmailWhitelist>, jest.Mock>
>;

const createMockRepository = (): MockRepo => ({
  find: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

const createMockMailService = () =>
  ({
    sendMail: jest.fn(),
  }) as unknown as jest.Mocked<Pick<MailService, 'sendMail'>>;

describe('UserEmailWhitelistsService', () => {
  let service: UserEmailWhitelistsService;
  let repository: MockRepo;
  let mailService: ReturnType<typeof createMockMailService>;

  const originalEnv = process.env;

  beforeEach(() => {
    repository = createMockRepository();
    mailService = createMockMailService();
    mailService.sendMail.mockResolvedValue(true);
    process.env = { ...originalEnv, WEB_APP_URL: 'https://dev.netweave.de' };

    service = new UserEmailWhitelistsService(
      repository as unknown as Repository<UserEmailWhitelist>,
      mailService as unknown as MailService,
    );
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('all', () => {
    it('should return all whitelisted emails ordered by emailOrDomain asc', async () => {
      const mockResult = [
        { id: 2, emailOrDomain: 'b.com' },
        { id: 1, emailOrDomain: 'a.com' },
      ];

      repository.find?.mockResolvedValue(mockResult);

      const result = await service.all();

      expect(repository.find).toHaveBeenCalledWith({
        relations: { createdBy: true },
        order: { emailOrDomain: 'asc' },
      });

      expect(result).toEqual(mockResult);
    });

    it('should return null when repository returns null', async () => {
      repository.find?.mockResolvedValue(null);

      const result = await service.all();

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save a whitelist entry and return full entity with relations', async () => {
      const dto: UserEmailWhitelistCreateDTO = {
        emailOrDomain: 'test@example.com',
      };

      const creatorId = 42;

      const savedEntity = {
        id: 10,
        emailOrDomain: dto.emailOrDomain,
      };

      const fullEntity = {
        id: 10,
        emailOrDomain: dto.emailOrDomain,
        createdBy: { id: creatorId },
      };

      repository.save?.mockResolvedValue(savedEntity);
      repository.findOne?.mockResolvedValue(fullEntity);

      const result = await service.save(dto, creatorId);

      expect(repository.save).toHaveBeenCalledWith({
        ...dto,
        createdBy: { id: creatorId },
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: savedEntity.id },
        relations: { createdBy: true },
      });

      expect(result).toEqual({ ...fullEntity, invitationMailSent: true });
    });

    it('sends a registration invitation mail to a whitelisted email', async () => {
      const dto: UserEmailWhitelistCreateDTO = {
        emailOrDomain: 'test@example.com',
      };

      repository.save?.mockResolvedValue({ id: 1, ...dto });
      repository.findOne?.mockResolvedValue({ id: 1, ...dto });

      await service.save(dto, 1);

      expect(mailService.sendMail).toHaveBeenCalledTimes(1);
      const mail = mailService.sendMail.mock.calls[0][0];
      expect(mail.to).toBe('test@example.com');
      expect(mail.html).toContain('https://dev.netweave.de/register');
    });

    it('reports a failed invitation mail without failing the save', async () => {
      const dto: UserEmailWhitelistCreateDTO = {
        emailOrDomain: 'test@example.com',
      };

      mailService.sendMail.mockResolvedValue(false);
      repository.save?.mockResolvedValue({ id: 1, ...dto });
      repository.findOne?.mockResolvedValue({ id: 1, ...dto });

      const result = await service.save(dto, 1);

      expect(result).toEqual({ id: 1, ...dto, invitationMailSent: false });
    });

    it('sends no mail for domain entries', async () => {
      const dto: UserEmailWhitelistCreateDTO = {
        emailOrDomain: '@example.com',
      };

      repository.save?.mockResolvedValue({ id: 1, ...dto });
      repository.findOne?.mockResolvedValue({ id: 1, ...dto });

      const result = await service.save(dto, 1);

      expect(mailService.sendMail).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 1, ...dto, invitationMailSent: null });
    });

    it('should return null if findOne returns null', async () => {
      const dto: UserEmailWhitelistCreateDTO = {
        emailOrDomain: 'test@example.com',
      };

      repository.save?.mockResolvedValue({ id: 1 });
      repository.findOne?.mockResolvedValue(null);

      const result = await service.save(dto, 1);

      expect(result).toBeNull();
    });
  });
});
