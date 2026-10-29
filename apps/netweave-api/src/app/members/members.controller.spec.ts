import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MemberUpsertDTO } from '@netweave/api-types';
import { AuthGuard } from '../auth/auth.guard';
import { InvitationsService } from '../invitations/invitations.service';
import { MemberController } from './members.controller';
import { MembersService } from './members.service';

const dto: MemberUpsertDTO = {
  name: 'Acme e.V.',
  contact: 'Erika Musterfrau',
  email: 'nt@example.com',
  resourcesRequirements: [
    { category: 'competencies', resources: 'Moderation', requirements: null },
  ],
  cultureWeights: [
    { itemId: 'Z1-G', weight: 80 },
    { itemId: 'Z1-I', weight: 60 },
    { itemId: 'Z1-W', weight: 40 },
    { itemId: 'Z1-S', weight: 20 },
  ],
  viewOfEnvironmentAnswers: [{ itemId: 'UA1', answer: 4 }],
  viewOfNature: 'fragile',
};

describe('MemberController', () => {
  let controller: MemberController;

  let membersService: Partial<
    Record<
      | 'getPage'
      | 'getLatestMember'
      | 'saveForInvitation'
      | 'confirmEmailChangeOrFail',
      jest.Mock
    >
  >;
  let invitationsService: Partial<Record<'findValidByToken', jest.Mock>>;

  beforeEach(async () => {
    membersService = {
      getPage: jest.fn(),
      getLatestMember: jest.fn().mockResolvedValue(null),
      saveForInvitation: jest.fn().mockResolvedValue({
        id: 7,
        ...dto,
        pendingEmail: 'neu@example.com',
        resourcesRequirements: dto.resourcesRequirements.map((item) => ({
          id: 1,
          memberId: 7,
          ...item,
        })),
        cultureWeights: dto.cultureWeights.map((item) => ({
          id: 1,
          memberId: 7,
          ...item,
          topicTotal: 200,
        })),
        viewOfEnvironmentAnswers: dto.viewOfEnvironmentAnswers.map((item) => ({
          id: 1,
          memberId: 7,
          ...item,
        })),
      }),
      confirmEmailChangeOrFail: jest.fn().mockResolvedValue(undefined),
    };
    invitationsService = {
      findValidByToken: jest
        .fn()
        .mockResolvedValue({ id: 123, email: 'nt@example.com' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        { provide: MembersService, useValue: membersService },
        { provide: InvitationsService, useValue: invitationsService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MemberController>(MemberController);
  });

  describe('getPage', () => {
    it('returns the requested page of the member overview', async () => {
      const page = {
        items: [{ id: 1, name: 'Acme e.V.', email: 'nt@example.com' }],
        page: 2,
        pageSize: 10,
        total: 11,
      };
      membersService.getPage?.mockResolvedValueOnce(page);

      expect(await controller.getPage(2, 10, 'acme')).toEqual(page);
      expect(membersService.getPage).toHaveBeenCalledWith(2, 10, 'acme');
    });
  });

  describe('getLatest', () => {
    it('returns only the general data of the latest member, never its emails', async () => {
      const createdAt = new Date();
      (membersService.getLatestMember as jest.Mock).mockResolvedValueOnce({
        id: 7,
        name: 'Acme e.V.',
        contact: null,
        email: 'nt@example.com',
        pendingEmail: 'neu@example.com',
        createdAt,
        updatedAt: createdAt,
      });

      expect(await controller.getLatest()).toEqual({
        id: 7,
        name: 'Acme e.V.',
        contact: null,
        createdAt,
        updatedAt: createdAt,
      });
    });

    it('returns null when there is no member', async () => {
      expect(await controller.getLatest()).toBeNull();
    });
  });

  describe('saveByToken', () => {
    it('saves the member for the invitation of a valid token and returns its emails and answers', async () => {
      const result = await controller.saveByToken('valid-token', dto);

      expect(invitationsService.findValidByToken).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(membersService.saveForInvitation).toHaveBeenCalledWith(
        { id: 123, email: 'nt@example.com' },
        dto,
      );
      expect(result).toEqual({
        email: 'nt@example.com',
        pendingEmail: 'neu@example.com',
        member: dto,
      });
    });

    it('throws NotFoundException and saves nothing when the token is invalid or expired', async () => {
      (invitationsService.findValidByToken as jest.Mock).mockResolvedValueOnce(
        null,
      );

      await expect(
        controller.saveByToken('unknown-token', dto),
      ).rejects.toThrow(NotFoundException);
      expect(membersService.saveForInvitation).not.toHaveBeenCalled();
    });
  });

  describe('confirmEmail', () => {
    it('confirms the email change of the token', async () => {
      const result = await controller.confirmEmail({ token: 'the-token' });

      expect(membersService.confirmEmailChangeOrFail).toHaveBeenCalledWith(
        'the-token',
      );
      expect(result).toEqual({ success: true });
    });
  });
});
