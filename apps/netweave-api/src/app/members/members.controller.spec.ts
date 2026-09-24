import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MemberUpsertDTO } from '@netweave/api-types';
import { InvitationsService } from '../invitations/invitations.service';
import { MemberController } from './members.controller';
import { MembersService } from './members.service';

const dto: MemberUpsertDTO = {
  name: 'Acme e.V.',
  contact: 'Erika Musterfrau',
  resourcesRequirements: [
    { category: 'competencies', resources: 'Moderation', requirements: null },
  ],
};

describe('MemberController', () => {
  let controller: MemberController;

  let membersService: Partial<
    Record<'getLatestMember' | 'saveForInvitation', jest.Mock>
  >;
  let invitationsService: Partial<Record<'findValidByToken', jest.Mock>>;

  beforeEach(async () => {
    membersService = {
      getLatestMember: jest.fn().mockResolvedValue(null),
      saveForInvitation: jest.fn().mockResolvedValue({
        id: 7,
        ...dto,
        resourcesRequirements: dto.resourcesRequirements.map((item) => ({
          id: 1,
          memberId: 7,
          ...item,
        })),
      }),
    };
    invitationsService = {
      findValidByToken: jest.fn().mockResolvedValue({ id: 123 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        { provide: MembersService, useValue: membersService },
        { provide: InvitationsService, useValue: invitationsService },
      ],
    }).compile();

    controller = module.get<MemberController>(MemberController);
  });

  describe('saveByToken', () => {
    it('saves the member for the invitation of a valid token', async () => {
      const result = await controller.saveByToken('valid-token', dto);

      expect(invitationsService.findValidByToken).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(membersService.saveForInvitation).toHaveBeenCalledWith(123, dto);
      expect(result).toEqual(dto);
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
});
