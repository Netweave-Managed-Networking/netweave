import { Test, TestingModule } from '@nestjs/testing';
import {
  InvitationCreateDTO,
  InvitationDTO,
  UserAuthDTO,
  UserDTO,
} from '@netweave/api-types';
import { AuthGuard } from '../auth/auth.guard';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';

const mockUser: UserDTO = {
  id: 1,
  email: 'test@example.de',
  role: 'editor',
} as UserDTO;

const mockAuthUser: UserAuthDTO = {
  sub: 1,
  user: mockUser,
};

const mockInvitation: InvitationDTO = {
  id: 123,
  email: 'nt@example.com',
  invitedBy: mockUser,
  status: 'pending',
} as InvitationDTO;

describe('InvitationsController', () => {
  let controller: InvitationsController;

  let service: Partial<Record<'save', jest.Mock>>;

  beforeEach(async () => {
    service = {
      save: jest.fn().mockResolvedValue(mockInvitation),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationsController],
      providers: [
        {
          provide: InvitationsService,
          useValue: service,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<InvitationsController>(InvitationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('creates an invitation using service with the inviting user id', async () => {
      const dto: InvitationCreateDTO = {
        email: 'nt@example.com',
      };

      const result = await controller.create(mockAuthUser, dto);

      expect(service.save).toHaveBeenCalledWith(dto, mockAuthUser.user.id);
      expect(result).toEqual(mockInvitation);
    });

    it('returns null when service returns null', async () => {
      const dto: InvitationCreateDTO = {
        email: 'nt@example.com',
      };

      (service.save as jest.Mock).mockResolvedValueOnce(null);

      const result = await controller.create(mockAuthUser, dto);

      expect(result).toBeNull();
    });
  });
});
