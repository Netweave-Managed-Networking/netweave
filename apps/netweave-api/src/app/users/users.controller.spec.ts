import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthDTO, UserDTO } from '@netweave/api-types';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockAdmin: UserDTO = {
  id: 7,
  email: 'admin@example.de',
  role: 'admin',
} as UserDTO;

const mockAuthUser: UserAuthDTO = { sub: 7, user: mockAdmin };

const mockEditor: UserDTO = {
  id: 8,
  email: 'editor@example.de',
  role: 'editor',
} as UserDTO;

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<Record<'all' | 'updateRole', jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      all: jest.fn().mockResolvedValue([mockAdmin, mockEditor]),
      updateRole: jest.fn().mockResolvedValue({ ...mockEditor, role: 'admin' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('all', () => {
    it('returns all users from the service', async () => {
      const result = await controller.all();

      expect(usersService.all).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockAdmin, mockEditor]);
    });
  });

  describe('updateRole', () => {
    it('updates the role using the service with the acting user id', async () => {
      const result = await controller.updateRole(mockAuthUser, 8, {
        role: 'admin',
      });

      expect(usersService.updateRole).toHaveBeenCalledWith(8, 'admin', 7);
      expect(result.role).toBe('admin');
    });
  });
});
