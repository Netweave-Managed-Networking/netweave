import { UserEmailWhitelistCreateDTO } from '@netweave/api-types';
import { Repository } from 'typeorm';
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

describe('UserEmailWhitelistsService', () => {
  let service: UserEmailWhitelistsService;
  let repository: MockRepo;

  beforeEach(() => {
    repository = createMockRepository();
    service = new UserEmailWhitelistsService(
      repository as unknown as Repository<UserEmailWhitelist>,
    );
  });

  afterEach(() => {
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

      expect(result).toEqual(fullEntity);
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
