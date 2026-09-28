import { EntityManager, Repository } from 'typeorm';
import { MemberResourceRequirement } from '../members/member-resource-requirement.entity';
import { Member } from '../members/member.entity';
import { MembersService } from '../members/members.service';
import { MatchingRun } from './matching-run.entity';
import { MatchingStrategy } from './matching-strategy';
import { Matching } from './matching.entity';
import { MatchingsService } from './matchings.service';

type MockManager = Partial<Record<keyof EntityManager, jest.Mock>>;

const createMockManager = (): MockManager => ({
  query: jest.fn().mockResolvedValue([{ locked: true }]),
  find: jest.fn().mockResolvedValue([]),
  count: jest.fn(),
  create: jest.fn((_target, entity) => ({ ...entity })),
  save: jest.fn((entity) => Promise.resolve({ id: 42, ...entity })),
  insert: jest.fn(),
});

const answered = (id: number, requirements = 'a need'): Member =>
  ({
    id,
    resourcesRequirements: [
      { category: 'premises', resources: null, requirements },
    ] as MemberResourceRequirement[],
  }) as Member;

describe('MatchingsService', () => {
  let service: MatchingsService;
  let manager: MockManager;
  let membersService: jest.Mocked<
    Pick<
      MembersService,
      | 'getAllWithResourcesRequirements'
      | 'haveResourcesRequirementsChangedSince'
    >
  >;
  let strategy: jest.Mocked<MatchingStrategy>;

  beforeEach(() => {
    manager = createMockManager();
    const repository = {
      manager: { ...manager, transaction: jest.fn((work) => work(manager)) },
    };
    membersService = {
      getAllWithResourcesRequirements: jest
        .fn()
        .mockResolvedValue([answered(1), answered(2), answered(3)]),
      haveResourcesRequirementsChangedSince: jest.fn().mockResolvedValue(true),
    };
    strategy = {
      // encodes the direction, so wrong pairings would show up in the rows
      score: jest.fn((seeker: Member, potentialMatch: Member) =>
        Promise.resolve({
          score: seeker.id * 10 + potentialMatch.id,
          details: null,
        }),
      ),
    };

    service = new MatchingsService(
      repository as unknown as Repository<MatchingRun>,
      membersService as unknown as MembersService,
      strategy,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const insertedRows = (): Partial<Matching>[] =>
    (manager.insert?.mock.calls ?? []).flatMap(([, rows]) => rows);

  const pairs = () =>
    insertedRows().map(
      (r) => `${r.memberSeekerId}->${r.memberPotentialMatchId}`,
    );

  describe('calculateAll', () => {
    it('stores a score from every member to every other member, but not to itself', async () => {
      const run = await service.calculateAll();

      expect(run).toMatchObject({
        id: 42,
        finishedAt: expect.any(Date),
        matchingCount: 6,
      });
      expect(insertedRows()).toEqual(
        [
          [1, 2, 12],
          [1, 3, 13],
          [2, 1, 21],
          [2, 3, 23],
          [3, 1, 31],
          [3, 2, 32],
        ].map(([memberSeekerId, memberPotentialMatchId, score]) => ({
          matchingRunId: 42,
          memberSeekerId,
          memberPotentialMatchId,
          score,
          details: null,
        })),
      );
    });

    it('leaves out members without any answers', async () => {
      membersService.getAllWithResourcesRequirements.mockResolvedValue([
        answered(1),
        { id: 2 } as Member, // no resources/requirements at all
        answered(3, '   '), // whitespace only
        answered(4),
      ]);

      await service.calculateAll();

      expect(pairs()).toEqual(['1->4', '4->1']);
    });

    it('does not ask for changes on the first run', async () => {
      await service.calculateAll();

      expect(
        membersService.haveResourcesRequirementsChangedSince,
      ).not.toHaveBeenCalled();
      expect(manager.save).toHaveBeenCalledTimes(2); // created, then marked finished
    });

    it('skips when no resource or requirement changed since the last run', async () => {
      const lastRunAt = new Date('2026-09-28T10:00:00Z');
      manager.find?.mockResolvedValue([{ id: 41, createdAt: lastRunAt }]);
      membersService.haveResourcesRequirementsChangedSince.mockResolvedValue(
        false,
      );

      expect(await service.calculateAll()).toBeNull();
      expect(
        membersService.haveResourcesRequirementsChangedSince,
      ).toHaveBeenCalledWith(lastRunAt);
      expect(strategy.score).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('runs when resources or requirements changed since the last run', async () => {
      manager.find?.mockResolvedValue([{ id: 41, createdAt: new Date() }]);
      membersService.haveResourcesRequirementsChangedSince.mockResolvedValue(
        true,
      );

      expect(await service.calculateAll()).not.toBeNull();
    });

    it('runs even without changes when forced', async () => {
      manager.find?.mockResolvedValue([{ id: 41, createdAt: new Date() }]);
      membersService.haveResourcesRequirementsChangedSince.mockResolvedValue(
        false,
      );

      expect(await service.calculateAll({ force: true })).not.toBeNull();
    });

    it('creates an empty run when there are fewer than two members', async () => {
      membersService.getAllWithResourcesRequirements.mockResolvedValue([
        answered(1),
      ]);

      await service.calculateAll();

      expect(manager.save).toHaveBeenCalledTimes(2);
      expect(manager.insert).not.toHaveBeenCalled();
    });

    it('inserts large runs in chunks', async () => {
      membersService.getAllWithResourcesRequirements.mockResolvedValue(
        Array.from({ length: 40 }, (_, i) => answered(i + 1)),
      );

      await service.calculateAll();

      expect(insertedRows()).toHaveLength(40 * 39);
      expect(manager.insert).toHaveBeenCalledTimes(2);
    });

    it('skips when another run holds the lock', async () => {
      manager.query?.mockResolvedValue([{ locked: false }]);

      expect(await service.calculateAll({ force: true })).toBeNull();
      expect(
        membersService.getAllWithResourcesRequirements,
      ).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('takes the lock inside the transaction before anything else', async () => {
      await service.calculateAll();

      expect(manager.query).toHaveBeenCalledWith(
        'SELECT pg_try_advisory_xact_lock($1) AS locked',
        [expect.any(Number)],
      );
      expect(manager.query?.mock.invocationCallOrder[0]).toBeLessThan(
        membersService.getAllWithResourcesRequirements.mock
          .invocationCallOrder[0],
      );
    });
  });

  describe('calculateScheduled', () => {
    it('logs instead of throwing when the run fails', async () => {
      membersService.getAllWithResourcesRequirements.mockRejectedValue(
        new Error('db down'),
      );

      await expect(service.calculateScheduled()).resolves.toBeUndefined();
    });
  });

  describe('getLatestRun', () => {
    it('returns a summary of the newest run without loading its matchings', async () => {
      const createdAt = new Date();
      manager.find?.mockResolvedValue([
        { id: 9, createdAt, updatedAt: createdAt, finishedAt: createdAt },
      ]);
      manager.count?.mockResolvedValue(12);

      expect(await service.getLatestRun()).toEqual({
        id: 9,
        createdAt,
        updatedAt: createdAt,
        finishedAt: createdAt,
        matchingCount: 12,
      });
      expect(manager.find).toHaveBeenCalledWith(MatchingRun, {
        order: { id: 'DESC' },
        take: 1,
      });
      expect(manager.count).toHaveBeenCalledWith(Matching, {
        where: { matchingRunId: 9 },
      });
    });

    it('returns null when there is no run yet', async () => {
      expect(await service.getLatestRun()).toBeNull();
      expect(manager.count).not.toHaveBeenCalled();
    });
  });
});
