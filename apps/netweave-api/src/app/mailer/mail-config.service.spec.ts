import { MailConfigUpdateDTO } from '@netweave/api-types';
import { Repository } from 'typeorm';
import { decryptSecret } from './crypto.util';
import { MailConfig } from './mail-config.entity';
import { MailConfigService } from './mail-config.service';
import { MailerService } from './mailer.service';

type MockRepo = Partial<Record<keyof Repository<MailConfig>, jest.Mock>>;

const createMockRepository = (): MockRepo => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const createMockMailerService = () =>
  ({
    getEffectiveConfig: jest.fn(),
    reload: jest.fn(),
  }) as unknown as jest.Mocked<
    Pick<MailerService, 'getEffectiveConfig' | 'reload'>
  >;

describe('MailConfigService', () => {
  let service: MailConfigService;
  let repository: MockRepo;
  let mailerService: ReturnType<typeof createMockMailerService>;

  const originalEnv = process.env;

  beforeEach(() => {
    repository = createMockRepository();
    mailerService = createMockMailerService();
    service = new MailConfigService(
      repository as unknown as Repository<MailConfig>,
      mailerService as unknown as MailerService,
    );

    process.env = { ...originalEnv, JWT_SECRET: 'test_jwt_secret' };
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('returns the DB row mapped to a DTO with hasPassword instead of the secret', async () => {
      const updatedAt = new Date('2026-01-01T00:00:00.000Z');
      repository.findOne?.mockResolvedValue({
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        authUser: 'smtp-user',
        authPassEncrypted: 'iv:tag:cipher',
        fromName: 'Netweave',
        fromAddress: 'info@netweave.de',
        updatedAt,
      });

      const result = await service.get();

      expect(result).toEqual({
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        authUser: 'smtp-user',
        hasPassword: true,
        fromName: 'Netweave',
        fromAddress: 'info@netweave.de',
        updatedAt,
      });
    });

    it('falls back to the effective (env-derived) config when there is no DB row', async () => {
      repository.findOne?.mockResolvedValue(null);
      mailerService.getEffectiveConfig.mockResolvedValue({
        host: 'localhost',
        port: 1025,
        secure: false,
        authUser: undefined,
        authPass: undefined,
        fromName: 'Netweave',
        fromAddress: 'info@netweave.de',
      });

      const result = await service.get();

      expect(result).toEqual({
        host: 'localhost',
        port: 1025,
        secure: false,
        authUser: null,
        hasPassword: false,
        fromName: 'Netweave',
        fromAddress: 'info@netweave.de',
        updatedAt: null,
      });
    });
  });

  describe('update', () => {
    const dto: MailConfigUpdateDTO = {
      host: 'smtp.example.com',
      port: 587,
      secure: true,
      authUser: 'smtp-user',
      authPass: 'new-secret',
      fromName: 'Netweave',
      fromAddress: 'info@netweave.de',
    };

    it('creates the singleton row, encrypts the password, and reloads the mailer', async () => {
      repository.findOne
        ?.mockResolvedValueOnce(undefined) // existing lookup
        .mockResolvedValueOnce({
          host: dto.host,
          port: dto.port,
          secure: dto.secure,
          authUser: dto.authUser,
          hasPassword: true,
          fromName: dto.fromName,
          fromAddress: dto.fromAddress,
          updatedAt: new Date(),
        });

      await service.update(dto, 7);

      expect(repository.save).toHaveBeenCalledTimes(1);
      const saved = repository.save?.mock.calls[0][0];
      expect(saved.id).toBeUndefined();
      expect(saved.authPassEncrypted).toBeDefined();
      expect(decryptSecret(saved.authPassEncrypted)).toBe('new-secret');
      expect(saved.updatedBy).toEqual({ id: 7 });

      expect(mailerService.reload).toHaveBeenCalledTimes(1);
    });

    it('keeps the existing encrypted password when authPass is omitted', async () => {
      repository.findOne
        ?.mockResolvedValueOnce({ id: 1, authPassEncrypted: 'iv:tag:cipher' })
        .mockResolvedValueOnce({
          host: dto.host,
          port: dto.port,
          secure: dto.secure,
          authUser: dto.authUser,
          fromName: dto.fromName,
          fromAddress: dto.fromAddress,
          updatedAt: new Date(),
        });

      const { authPass: _authPass, ...dtoWithoutPassword } = dto;
      await service.update(dtoWithoutPassword as MailConfigUpdateDTO, 7);

      const saved = repository.save?.mock.calls[0][0];
      expect(saved.id).toBe(1);
      expect(saved.authPassEncrypted).toBe('iv:tag:cipher');
    });

    it('clears the stored password when authPass is an empty string', async () => {
      repository.findOne
        ?.mockResolvedValueOnce({ id: 1, authPassEncrypted: 'iv:tag:cipher' })
        .mockResolvedValueOnce({
          host: dto.host,
          port: dto.port,
          secure: dto.secure,
          authUser: dto.authUser,
          fromName: dto.fromName,
          fromAddress: dto.fromAddress,
          updatedAt: new Date(),
        });

      await service.update({ ...dto, authPass: '' }, 7);

      const saved = repository.save?.mock.calls[0][0];
      expect(saved.authPassEncrypted).toBeNull();
    });
  });
});
