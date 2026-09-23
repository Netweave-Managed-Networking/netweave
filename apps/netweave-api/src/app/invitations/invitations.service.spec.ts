import { InvitationCreateDTO } from '@netweave/api-types';
import { MoreThan, Repository } from 'typeorm';
import { MailerService } from '../mailer/mailer.service';
import { Invitation } from './invitation.entity';
import { InvitationsService } from './invitations.service';

type MockRepo = Partial<Record<keyof Repository<Invitation>, jest.Mock>>;

const createMockRepository = (): MockRepo => ({
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
});

const createMockMailerService = () =>
  ({
    sendMail: jest.fn(),
  }) as unknown as jest.Mocked<Pick<MailerService, 'sendMail'>>;

describe('InvitationsService', () => {
  let service: InvitationsService;
  let repository: MockRepo;
  let mailerService: ReturnType<typeof createMockMailerService>;

  const originalEnv = process.env;

  beforeEach(() => {
    repository = createMockRepository();
    mailerService = createMockMailerService();
    mailerService.sendMail.mockResolvedValue(true);
    process.env = { ...originalEnv, WEB_APP_URL: 'https://dev.netweave.de' };

    service = new InvitationsService(
      repository as unknown as Repository<Invitation>,
      mailerService as unknown as MailerService,
    );
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('all', () => {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    it('maps raw pending/dispatched invitations to their status, and marks expired ones', async () => {
      repository.find?.mockResolvedValue([
        {
          id: 1,
          email: 'pending@example.com',
          status: 'pending',
          expireDate: oneHourFromNow,
          answeredDate: null,
          createdAt: new Date('2026-01-01'),
        },
        {
          id: 2,
          email: 'dispatched@example.com',
          status: 'dispatched',
          expireDate: oneHourFromNow,
          answeredDate: null,
          createdAt: new Date('2026-01-02'),
        },
        {
          id: 3,
          email: 'expired@example.com',
          status: 'dispatched',
          expireDate: oneHourAgo,
          answeredDate: null,
          createdAt: new Date('2026-01-03'),
        },
        {
          id: 4,
          email: 'failed@example.com',
          status: 'failed',
          expireDate: oneHourFromNow,
          answeredDate: null,
          createdAt: new Date('2026-01-04'),
        },
        {
          id: 5,
          email: 'answered@example.com',
          status: 'dispatched',
          expireDate: oneHourAgo,
          answeredDate: new Date('2026-01-05'),
          createdAt: new Date('2026-01-05'),
        },
      ]);

      const result = await service.all();

      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });

      expect(result.map((i) => i.status)).toEqual([
        'failed',
        'pending',
        'answered',
        'dispatched',
        'expired',
      ]);
    });
  });

  describe('findValidByToken', () => {
    it('queries for a non-expired invitation with the given token', async () => {
      const invitation = { id: 1, email: 'nt@example.com', token: 'abc' };
      repository.findOne?.mockResolvedValue(invitation);

      const result = await service.findValidByToken('abc');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { token: 'abc', expireDate: MoreThan(expect.any(Date)) },
      });
      expect(result).toEqual(invitation);
    });

    it('returns null when no matching, non-expired invitation exists', async () => {
      repository.findOne?.mockResolvedValue(null);

      const result = await service.findValidByToken('unknown');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save an invitation with a generated token and the inviting user, and return full entity with relations', async () => {
      const dto: InvitationCreateDTO = {
        email: 'nt@example.com',
      };

      const invitedById = 42;

      const savedEntity = {
        id: 10,
        email: dto.email,
      };

      const fullEntity = {
        id: 10,
        email: dto.email,
        invitedBy: { id: invitedById },
        status: 'pending',
      };

      repository.save?.mockResolvedValue(savedEntity);
      repository.findOne?.mockResolvedValue(fullEntity);
      mailerService.sendMail.mockResolvedValue(true);

      const result = await service.save(dto, invitedById);

      expect(repository.save).toHaveBeenCalledTimes(1);
      const saveArg = (repository.save as jest.Mock).mock.calls[0][0];
      expect(saveArg.email).toEqual(dto.email);
      expect(saveArg.invitedBy).toEqual({ id: invitedById });
      expect(typeof saveArg.token).toBe('string');
      expect(saveArg.token.length).toBeGreaterThanOrEqual(32);

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: dto.email }),
      );
      const mailArg = mailerService.sendMail.mock.calls[0][0];
      expect(mailArg.html).toContain(saveArg.token);
      expect(mailArg.html).toContain('Hallo');

      expect(repository.update).toHaveBeenCalledWith(savedEntity.id, {
        status: 'dispatched',
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: savedEntity.id },
        relations: { invitedBy: true },
      });

      expect(result).toEqual(fullEntity);
    });

    it('sets the status to failed when sending the invitation mail fails', async () => {
      const dto: InvitationCreateDTO = { email: 'nt@example.com' };
      const invitedById = 42;

      repository.save?.mockResolvedValue({ id: 10, email: dto.email });
      repository.findOne?.mockResolvedValue({ id: 10, status: 'failed' });
      mailerService.sendMail.mockResolvedValue(false);

      await service.save(dto, invitedById);

      expect(repository.update).toHaveBeenCalledWith(10, {
        status: 'failed',
      });
    });

    it('should generate a different token for every invitation', async () => {
      const dto: InvitationCreateDTO = { email: 'nt@example.com' };

      repository.save?.mockResolvedValue({ id: 1 });
      repository.findOne?.mockResolvedValue({ id: 1 });

      await service.save(dto, 1);
      await service.save(dto, 1);

      const [firstCallArg, secondCallArg] = (repository.save as jest.Mock).mock
        .calls;

      expect(firstCallArg[0].token).not.toEqual(secondCallArg[0].token);
    });

    it('should return null if findOne returns null', async () => {
      const dto: InvitationCreateDTO = { email: 'nt@example.com' };

      repository.save?.mockResolvedValue({ id: 1 });
      repository.findOne?.mockResolvedValue(null);

      const result = await service.save(dto, 1);

      expect(result).toBeNull();
    });
  });
});
