import {
  BadGatewayException,
  HttpStatus,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MemberUpsertDTO } from '@netweave/api-types';
import { InvitationsService } from '../invitations/invitations.service';
import {
  MemberController,
  REQUIREMENTS_GENERATION_LIMIT,
} from './members.controller';
import { MembersService } from './members.service';
import { REQUIREMENTS_GENERATOR } from './requirements-generation/requirements-generator';

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
};

describe('MemberController', () => {
  let controller: MemberController;

  let membersService: Partial<
    Record<
      'getLatestMember' | 'saveForInvitation' | 'confirmEmailChangeOrFail',
      jest.Mock
    >
  >;
  let invitationsService: Partial<Record<'findValidByToken', jest.Mock>>;
  let requirementsGenerator: Record<'generate', jest.Mock> | null;

  const createController = async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        { provide: MembersService, useValue: membersService },
        { provide: InvitationsService, useValue: invitationsService },
        { provide: REQUIREMENTS_GENERATOR, useValue: requirementsGenerator },
      ],
    }).compile();

    controller = module.get<MemberController>(MemberController);
  };

  beforeEach(async () => {
    membersService = {
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
      }),
      confirmEmailChangeOrFail: jest.fn().mockResolvedValue(undefined),
    };
    invitationsService = {
      findValidByToken: jest
        .fn()
        .mockResolvedValue({ id: 123, email: 'nt@example.com' }),
    };
    requirementsGenerator = {
      generate: jest.fn().mockResolvedValue({
        premises: 'Wir brauchen einen Raum für 20 Personen.',
      }),
    };

    await createController();
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

  describe('generateRequirements', () => {
    const dto = { projectDescription: 'Wir wollen ein Repair-Café eröffnen.' };

    it('returns the requirements generated from the project description for a valid token', async () => {
      const result = await controller.generateRequirements('valid-token', dto);

      expect(invitationsService.findValidByToken).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(requirementsGenerator?.generate).toHaveBeenCalledWith(
        dto.projectDescription,
      );
      expect(result).toEqual({
        premises: 'Wir brauchen einen Raum für 20 Personen.',
      });
    });

    it('throws NotFoundException and asks no llm when the token is invalid or expired', async () => {
      (invitationsService.findValidByToken as jest.Mock).mockResolvedValueOnce(
        null,
      );

      await expect(
        controller.generateRequirements('unknown-token', dto),
      ).rejects.toThrow(NotFoundException);
      expect(requirementsGenerator?.generate).not.toHaveBeenCalled();
    });

    it('throws ServiceUnavailableException when no llm is configured', async () => {
      requirementsGenerator = null;
      await createController();

      await expect(
        controller.generateRequirements('valid-token', dto),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('answers 429 once an invitation used up its generations, other invitations still work', async () => {
      for (let i = 0; i < REQUIREMENTS_GENERATION_LIMIT.calls; i++) {
        await controller.generateRequirements('valid-token', dto);
      }

      await expect(
        controller.generateRequirements('valid-token', dto),
      ).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });
      expect(requirementsGenerator?.generate).toHaveBeenCalledTimes(
        REQUIREMENTS_GENERATION_LIMIT.calls,
      );

      (invitationsService.findValidByToken as jest.Mock).mockResolvedValueOnce({
        id: 456,
        email: 'other@example.com',
      });
      await expect(
        controller.generateRequirements('other-token', dto),
      ).resolves.toBeDefined();
    });

    it('throws BadGatewayException when the llm fails', async () => {
      requirementsGenerator?.generate.mockRejectedValueOnce(
        new Error('timeout'),
      );

      await expect(
        controller.generateRequirements('valid-token', dto),
      ).rejects.toThrow(BadGatewayException);
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
