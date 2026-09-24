import { MemberUpsertDTO } from '@netweave/api-types';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { Invitation } from '../invitations/invitation.entity';
import { MemberResourceRequirement } from './member-resource-requirement.entity';
import { Member } from './member.entity';
import { MembersService } from './members.service';

type MockManager = Partial<Record<keyof EntityManager, jest.Mock>>;

const createMockManager = (): MockManager => ({
  findOne: jest.fn(),
  save: jest.fn((_target, entity) => Promise.resolve({ id: 7, ...entity })),
  upsert: jest.fn(),
  update: jest.fn(),
  findOneOrFail: jest.fn(),
});

const dto: MemberUpsertDTO = {
  name: 'Acme e.V.',
  contact: 'Erika Musterfrau',
  resourcesRequirements: [],
};

describe('MembersService', () => {
  let service: MembersService;
  let manager: MockManager;

  beforeEach(() => {
    manager = createMockManager();
    const repository = {
      manager: {
        transaction: jest.fn((work) => work(manager)),
      },
    };
    service = new MembersService(repository as unknown as Repository<Member>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveForInvitation', () => {
    it('creates a new member linked to the invitation when none exists yet', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(123, dto);

      expect(manager.findOne).toHaveBeenCalledWith(Member, {
        where: { invitation: { id: 123 } },
      });
      expect(manager.save).toHaveBeenCalledWith(Member, {
        name: 'Acme e.V.',
        contact: 'Erika Musterfrau',
        invitation: { id: 123 },
      });
    });

    it('updates the existing member of the invitation', async () => {
      manager.findOne?.mockResolvedValue({
        id: 7,
        name: 'Old name',
        contact: 'Old contact',
      });

      await service.saveForInvitation(123, dto);

      expect(manager.save).toHaveBeenCalledWith(Member, {
        id: 7,
        name: 'Acme e.V.',
        contact: 'Erika Musterfrau',
        invitation: { id: 123 },
      });
    });

    it('stores an empty contact as null', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(123, { ...dto, contact: '' });

      expect(manager.save).toHaveBeenCalledWith(
        Member,
        expect.objectContaining({ contact: null }),
      );
    });

    it('upserts the resources and requirements per category of the member, storing empty texts as null', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(123, {
        ...dto,
        resourcesRequirements: [
          {
            category: 'competencies',
            resources: 'Moderation',
            requirements: '',
          },
          { category: 'land', resources: null, requirements: 'Ackerfläche' },
        ],
      });

      expect(manager.upsert).toHaveBeenCalledWith(
        MemberResourceRequirement,
        [
          {
            memberId: 7,
            category: 'competencies',
            resources: 'Moderation',
            requirements: null,
          },
          {
            memberId: 7,
            category: 'land',
            resources: null,
            requirements: 'Ackerfläche',
          },
        ],
        ['memberId', 'category'],
      );
    });

    it('does not upsert when no resources and requirements are given', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(123, dto);

      expect(manager.upsert).not.toHaveBeenCalled();
    });

    it('returns the saved member including its resources and requirements', async () => {
      const saved = { id: 7, ...dto, resourcesRequirements: [] };
      manager.findOne?.mockResolvedValue(null);
      manager.findOneOrFail?.mockResolvedValue(saved);

      const result = await service.saveForInvitation(123, dto);

      expect(manager.findOneOrFail).toHaveBeenCalledWith(Member, {
        where: { id: 7 },
        relations: { resourcesRequirements: true },
      });
      expect(result).toBe(saved);
    });

    it('marks the invitation as answered, unless it already is', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(123, dto);

      expect(manager.update).toHaveBeenCalledWith(
        Invitation,
        { id: 123, answeredDate: IsNull() },
        { answeredDate: expect.any(Date) },
      );
    });
  });
});
