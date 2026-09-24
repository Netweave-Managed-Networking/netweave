import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';

type MockRepo = Partial<Record<keyof Repository<User>, jest.Mock>>;

const createMockRepository = (): MockRepo => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepo;

  beforeEach(() => {
    repository = createMockRepository();
    service = new UsersService(repository as unknown as Repository<User>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('all', () => {
    it('returns all users ordered by email asc', async () => {
      const users = [{ id: 1, email: 'a@example.de', role: 'admin' }];
      repository.find?.mockResolvedValue(users);

      const result = await service.all();

      expect(repository.find).toHaveBeenCalledWith({ order: { email: 'asc' } });
      expect(result).toEqual(users);
    });
  });

  describe('updateRole', () => {
    it('saves the user with the new role', async () => {
      const user = { id: 2, email: 'b@example.de', role: 'editor' };
      repository.findOneBy?.mockResolvedValue(user);
      repository.save?.mockImplementation(async (u) => u);

      const result = await service.updateRole(2, 'viewer', 1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 2 });
      expect(repository.save).toHaveBeenCalledWith({ ...user, role: 'viewer' });
      expect(result.role).toBe('viewer');
    });

    it('throws NotFoundException when the user does not exist', async () => {
      repository.findOneBy?.mockResolvedValue(null);

      await expect(service.updateRole(99, 'admin', 1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when the acting user changes their own role', async () => {
      await expect(service.updateRole(1, 'viewer', 1)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repository.findOneBy).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
