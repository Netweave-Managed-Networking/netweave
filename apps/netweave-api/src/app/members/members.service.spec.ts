import { MemberUpsertDTO } from '@netweave/api-types';
import { EntityManager, IsNull, MoreThan, Repository } from 'typeorm';
import { Invitation } from '../invitations/invitation.entity';
import { MemberCultureWeight } from './member-culture-weight.entity';
import { MemberResourceRequirement } from './member-resource-requirement.entity';
import { Member } from './member.entity';
import { MembersService } from './members.service';

type MockManager = Partial<Record<keyof EntityManager, jest.Mock>>;

const createMockManager = (): MockManager => ({
  exists: jest.fn(),
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
  cultureWeights: [],
};

describe('MembersService', () => {
  let service: MembersService;
  let manager: MockManager;

  beforeEach(() => {
    manager = createMockManager();
    const repository = {
      manager: {
        exists: manager.exists,
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
        {
          conflictPaths: ['memberId', 'category'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    });

    it('does not upsert when no resources, requirements and culture weights are given', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(123, dto);

      expect(manager.upsert).not.toHaveBeenCalled();
    });

    it('upserts the culture weights of the member with the total of their topic', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(123, {
        ...dto,
        cultureWeights: [
          { itemId: 'Z1-G', weight: 100 },
          { itemId: 'Z1-I', weight: 90 },
          { itemId: 'Z1-W', weight: 80 },
          { itemId: 'Z1-S', weight: 70 },
          { itemId: 'Z3-G', weight: 0 },
          { itemId: 'Z3-I', weight: 10 },
          { itemId: 'Z3-W', weight: 20 },
          { itemId: 'Z3-S', weight: 30 },
        ],
      });

      expect(manager.upsert).toHaveBeenCalledWith(
        MemberCultureWeight,
        [
          { memberId: 7, itemId: 'Z1-G', weight: 100, topicTotal: 340 },
          { memberId: 7, itemId: 'Z1-I', weight: 90, topicTotal: 340 },
          { memberId: 7, itemId: 'Z1-W', weight: 80, topicTotal: 340 },
          { memberId: 7, itemId: 'Z1-S', weight: 70, topicTotal: 340 },
          { memberId: 7, itemId: 'Z3-G', weight: 0, topicTotal: 60 },
          { memberId: 7, itemId: 'Z3-I', weight: 10, topicTotal: 60 },
          { memberId: 7, itemId: 'Z3-W', weight: 20, topicTotal: 60 },
          { memberId: 7, itemId: 'Z3-S', weight: 30, topicTotal: 60 },
        ],
        {
          conflictPaths: ['memberId', 'itemId'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    });

    it('returns the saved member including its resources, requirements and culture weights', async () => {
      const saved = {
        id: 7,
        ...dto,
        resourcesRequirements: [],
        cultureWeights: [],
      };
      manager.findOne?.mockResolvedValue(null);
      manager.findOneOrFail?.mockResolvedValue(saved);

      const result = await service.saveForInvitation(123, dto);

      expect(manager.findOneOrFail).toHaveBeenCalledWith(Member, {
        where: { id: 7 },
        relations: { resourcesRequirements: true, cultureWeights: true },
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

  describe('haveResourcesRequirementsChangedSince', () => {
    it('checks for resources or requirements updated after the given date', async () => {
      const since = new Date('2026-09-28T10:00:00Z');
      manager.exists?.mockResolvedValue(true);

      expect(await service.haveResourcesRequirementsChangedSince(since)).toBe(
        true,
      );
      expect(manager.exists).toHaveBeenCalledWith(MemberResourceRequirement, {
        where: { updatedAt: MoreThan(since) },
      });
    });
  });
});
