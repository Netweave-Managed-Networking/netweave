import { Test, TestingModule } from '@nestjs/testing';
import {
  UserAuthDTO,
  UserDTO,
  UserEmailWhitelistCreateDTO,
  UserEmailWhitelistDTO,
} from '@netweave/api-types';
import { AuthGuard } from '../auth/auth.guard';
import { UserEmailWhitelistsController } from './user-email-whitelists.controller';
import { UserEmailWhitelistsService } from './user-email-whitelists.service';

const mockUser: UserDTO = {
  id: 1,
  email: 'test@example.de',
  role: 'editor',
} as UserDTO;

const mockAuthUser: UserAuthDTO = {
  sub: 1,
  user: mockUser,
};

const mockWhitelistEntry: UserEmailWhitelistDTO = {
  id: 123,
  emailOrDomain: 'example.com',
  createdBy: mockUser,
} as UserEmailWhitelistDTO;

describe('UserEmailWhitelistsController', () => {
  let controller: UserEmailWhitelistsController;

  let service: Partial<Record<'all' | 'create', jest.Mock>>;

  beforeEach(async () => {
    service = {
      all: jest.fn().mockResolvedValue([mockWhitelistEntry]),
      create: jest.fn().mockResolvedValue(mockWhitelistEntry),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserEmailWhitelistsController],
      providers: [
        {
          provide: UserEmailWhitelistsService,
          useValue: service,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserEmailWhitelistsController>(
      UserEmailWhitelistsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('all', () => {
    it('returns all whitelist entries from service', async () => {
      const result = await controller.all();

      expect(service.all).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockWhitelistEntry]);
    });

    it('returns null when service returns null', async () => {
      (service.all as jest.Mock).mockResolvedValueOnce(null);

      const result = await controller.all();

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates a whitelist entry using service with user id', async () => {
      const dto: UserEmailWhitelistCreateDTO = {
        emailOrDomain: 'example.com',
      };

      const result = await controller.create(mockAuthUser, dto);

      expect(service.create).toHaveBeenCalledWith(dto, mockAuthUser.user.id);
      expect(result).toEqual(mockWhitelistEntry);
    });

    it('returns null when service returns null', async () => {
      const dto: UserEmailWhitelistCreateDTO = {
        emailOrDomain: 'example.com',
      };

      (service.create as jest.Mock).mockResolvedValueOnce(null);

      const result = await controller.create(mockAuthUser, dto);

      expect(result).toBeNull();
    });
  });
});
