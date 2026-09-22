import { InvitationCreateDTO } from '@netweave/api-types';
import { Repository } from 'typeorm';
import { Invitation } from './invitation.entity';
import { InvitationsService } from './invitations.service';

type MockRepo = Partial<Record<keyof Repository<Invitation>, jest.Mock>>;

const createMockRepository = (): MockRepo => ({
  save: jest.fn(),
  findOne: jest.fn(),
});

describe('InvitationsService', () => {
  let service: InvitationsService;
  let repository: MockRepo;

  beforeEach(() => {
    repository = createMockRepository();
    service = new InvitationsService(
      repository as unknown as Repository<Invitation>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      const result = await service.save(dto, invitedById);

      expect(repository.save).toHaveBeenCalledTimes(1);
      const saveArg = (repository.save as jest.Mock).mock.calls[0][0];
      expect(saveArg.email).toEqual(dto.email);
      expect(saveArg.invitedBy).toEqual({ id: invitedById });
      expect(typeof saveArg.token).toBe('string');
      expect(saveArg.token.length).toBeGreaterThanOrEqual(32);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: savedEntity.id },
        relations: { invitedBy: true },
      });

      expect(result).toEqual(fullEntity);
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
