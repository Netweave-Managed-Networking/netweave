import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  InvitationCreateDTO,
  InvitationDTO,
  InvitationListItemDTO,
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

  let service: Partial<Record<'save' | 'all' | 'findValidByToken', jest.Mock>>;

  beforeEach(async () => {
    service = {
      save: jest.fn().mockResolvedValue(mockInvitation),
      all: jest.fn().mockResolvedValue([]),
      findValidByToken: jest.fn().mockResolvedValue(mockInvitation),
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

  describe('all', () => {
    it('returns the invitation list from the service', async () => {
      const mockList: InvitationListItemDTO[] = [
        {
          id: 1,
          email: 'nt@example.com',
          status: 'pending',
          createdAt: new Date(),
        },
      ];

      (service.all as jest.Mock).mockResolvedValueOnce(mockList);

      const result = await controller.all();

      expect(service.all).toHaveBeenCalled();
      expect(result).toEqual(mockList);
    });
  });

  describe('findByToken', () => {
    it('returns the email and no member for a valid, unanswered token', async () => {
      const result = await controller.findByToken('valid-token');

      expect(service.findValidByToken).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual({ email: mockInvitation.email, member: null });
    });

    it('returns the saved member data for a valid token', async () => {
      (service.findValidByToken as jest.Mock).mockResolvedValueOnce({
        ...mockInvitation,
        member: {
          id: 7,
          name: 'Acme e.V.',
          contact: 'Erika Musterfrau',
          resourcesRequirements: [
            {
              id: 1,
              memberId: 7,
              category: 'premises',
              resources: 'Seminarraum für 20 Personen',
              requirements: null,
            },
          ],
        },
      });

      const result = await controller.findByToken('valid-token');

      expect(result).toEqual({
        email: mockInvitation.email,
        member: {
          name: 'Acme e.V.',
          contact: 'Erika Musterfrau',
          resourcesRequirements: [
            {
              category: 'premises',
              resources: 'Seminarraum für 20 Personen',
              requirements: null,
            },
          ],
        },
      });
    });

    it('throws NotFoundException when the token is invalid or expired', async () => {
      (service.findValidByToken as jest.Mock).mockResolvedValueOnce(null);

      await expect(controller.findByToken('unknown-token')).rejects.toThrow(
        NotFoundException,
      );
    });
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
