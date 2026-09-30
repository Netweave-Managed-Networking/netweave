import { Logger } from '@nestjs/common';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { MemberResourceRequirement } from '../members/member-resource-requirement.entity';
import { Member } from '../members/member.entity';
import { MembersService } from '../members/members.service';
import { MatchingRun } from './matching-run.entity';
import { MatchingStrategy } from './matching-strategy';
import { Matching } from './matching.entity';
import { MatchingsService } from './matchings.service';

type MockManager = Partial<Record<keyof EntityManager, jest.Mock>>;

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const createMockManager = (): MockManager => ({
  query: jest.fn().mockResolvedValue([{ locked: true }]),
  find: jest.fn().mockResolvedValue([]),
  findOneBy: jest.fn().mockResolvedValue(null), // no run in progress by default
  count: jest.fn(),
  create: jest.fn((_target, entity) => ({ ...entity })),
  save: jest.fn((entity) =>
    Promise.resolve({ id: 42, finishedAt: null, failedAt: null, ...entity }),
  ),
  insert: jest.fn(),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
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

  describe('calculateScheduled', () => {
    it('stores a score from every member to every other member, but not to itself', async () => {
      await service.calculateScheduled();

      expect(manager.update).toHaveBeenCalledWith(
        MatchingRun,
        { id: 42, failedAt: IsNull() },
        { finishedAt: expect.any(Date) },
      );
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

      await service.calculateScheduled();

      expect(pairs()).toEqual(['1->4', '4->1']);
    });

    it('does not ask for changes on the first run', async () => {
      await service.calculateScheduled();

      expect(
        membersService.haveResourcesRequirementsChangedSince,
      ).not.toHaveBeenCalled();
      expect(manager.save).toHaveBeenCalledTimes(1); // the new, empty run
      expect(manager.update).toHaveBeenCalledTimes(1); // marked finished
    });

    it('skips when no resource or requirement changed since the last run', async () => {
      const lastRunAt = new Date('2026-09-28T10:00:00Z');
      manager.find?.mockResolvedValue([
        { id: 41, createdAt: lastRunAt, finishedAt: lastRunAt },
      ]);
      membersService.haveResourcesRequirementsChangedSince.mockResolvedValue(
        false,
      );

      await service.calculateScheduled();

      expect(
        membersService.haveResourcesRequirementsChangedSince,
      ).toHaveBeenCalledWith(lastRunAt);
      expect(strategy.score).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('runs when resources or requirements changed since the last run', async () => {
      const lastRunAt = new Date();
      manager.find?.mockResolvedValue([
        { id: 41, createdAt: lastRunAt, finishedAt: lastRunAt },
      ]);
      membersService.haveResourcesRequirementsChangedSince.mockResolvedValue(
        true,
      );

      await service.calculateScheduled();

      expect(manager.save).toHaveBeenCalledTimes(1);
    });

    it('creates an empty run when there are fewer than two members', async () => {
      membersService.getAllWithResourcesRequirements.mockResolvedValue([
        answered(1),
      ]);

      await service.calculateScheduled();

      expect(manager.save).toHaveBeenCalledTimes(1);
      expect(manager.update).toHaveBeenCalledWith(
        MatchingRun,
        { id: 42, failedAt: IsNull() },
        { finishedAt: expect.any(Date) },
      );
      expect(manager.insert).not.toHaveBeenCalled();
    });

    it('inserts large runs in chunks', async () => {
      membersService.getAllWithResourcesRequirements.mockResolvedValue(
        Array.from({ length: 40 }, (_, i) => answered(i + 1)),
      );

      await service.calculateScheduled();

      expect(insertedRows()).toHaveLength(40 * 39);
      expect(manager.insert).toHaveBeenCalledTimes(2);
    });

    it('skips when another run holds the lock', async () => {
      manager.query?.mockResolvedValue([{ locked: false }]);

      await service.calculateScheduled();

      expect(
        membersService.getAllWithResourcesRequirements,
      ).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('skips when a run is already in progress', async () => {
      manager.findOneBy?.mockResolvedValue({
        id: 41,
        createdAt: new Date(), // just started, not stale
        finishedAt: null,
        failedAt: null,
      });

      await service.calculateScheduled();

      expect(
        membersService.getAllWithResourcesRequirements,
      ).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('recovers from a stale in-progress run (e.g. its process crashed) and starts a new one', async () => {
      manager.findOneBy?.mockResolvedValue({
        id: 41,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago: way past any realistic run duration
        finishedAt: null,
        failedAt: null,
      });

      await service.calculateScheduled();

      expect(manager.update).toHaveBeenCalledWith(MatchingRun, 41, {
        failedAt: expect.any(Date),
      });
      expect(membersService.getAllWithResourcesRequirements).toHaveBeenCalled();
      expect(manager.save).toHaveBeenCalledTimes(1); // the new run
    });

    it('takes the lock inside the transaction before anything else', async () => {
      await service.calculateScheduled();

      expect(manager.query).toHaveBeenCalledWith(
        'SELECT pg_try_advisory_xact_lock($1) AS locked',
        [expect.any(Number)],
      );
      expect(manager.query?.mock.invocationCallOrder[0]).toBeLessThan(
        membersService.getAllWithResourcesRequirements.mock
          .invocationCallOrder[0],
      );
    });

    it('marks the run as failed instead of throwing when the computation fails', async () => {
      membersService.getAllWithResourcesRequirements.mockRejectedValue(
        new Error('db down'),
      );

      await expect(service.calculateScheduled()).resolves.toBeUndefined();

      expect(manager.update).toHaveBeenCalledWith(
        MatchingRun,
        { id: 42, failedAt: IsNull() },
        { failedAt: expect.any(Date) },
      );
    });
  });

  describe('triggerRun', () => {
    it('creates a run and returns it immediately, before the computation finishes', async () => {
      const result = await service.triggerRun();

      expect(result).toMatchObject({
        id: 42,
        finishedAt: null,
        failedAt: null,
        matchingCount: 0,
      });
      // the actual computation only happens afterwards, in the background
      expect(manager.insert).not.toHaveBeenCalled();

      await flushPromises();

      expect(manager.insert).toHaveBeenCalled();
      expect(manager.update).toHaveBeenCalledWith(
        MatchingRun,
        { id: 42, failedAt: IsNull() },
        { finishedAt: expect.any(Date) },
      );
    });

    it('never checks for changes, even without any', async () => {
      membersService.haveResourcesRequirementsChangedSince.mockResolvedValue(
        false,
      );

      const result = await service.triggerRun();
      await flushPromises();

      expect(result).not.toBeNull();
      expect(
        membersService.haveResourcesRequirementsChangedSince,
      ).not.toHaveBeenCalled();
      expect(manager.insert).toHaveBeenCalled();
    });

    it('returns null when another run holds the lock', async () => {
      manager.query?.mockResolvedValue([{ locked: false }]);

      expect(await service.triggerRun()).toBeNull();
      await flushPromises();

      expect(
        membersService.getAllWithResourcesRequirements,
      ).not.toHaveBeenCalled();
    });

    it('returns null when a run is already in progress', async () => {
      manager.findOneBy?.mockResolvedValue({
        id: 41,
        createdAt: new Date(), // just started, not stale
        finishedAt: null,
        failedAt: null,
      });

      expect(await service.triggerRun()).toBeNull();
      await flushPromises();

      expect(
        membersService.getAllWithResourcesRequirements,
      ).not.toHaveBeenCalled();
    });

    it('marks the run as failed instead of throwing when the background computation fails', async () => {
      membersService.getAllWithResourcesRequirements.mockRejectedValue(
        new Error('db down'),
      );

      const result = await service.triggerRun();
      expect(result).not.toBeNull();

      await flushPromises();

      expect(manager.update).toHaveBeenCalledWith(
        MatchingRun,
        { id: 42, failedAt: IsNull() },
        { failedAt: expect.any(Date) },
      );
    });

    it('does not overwrite a run already reaped as stale by a concurrent begin, and warns instead', async () => {
      // the finishedAt update matches no row because the run was reaped (failedAt set) while it was computing
      manager.update?.mockResolvedValue({ affected: 0 });
      const warn = jest.spyOn(Logger.prototype, 'warn');

      await service.calculateScheduled();

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('already reaped as stale'),
      );
    });
  });

  describe('getLatestRun', () => {
    it('returns a summary of the newest successfully finished run without loading its matchings', async () => {
      const createdAt = new Date();
      manager.find?.mockResolvedValue([
        {
          id: 9,
          createdAt,
          updatedAt: createdAt,
          finishedAt: createdAt,
          failedAt: null,
        },
      ]);
      manager.count?.mockResolvedValue(12);

      expect(await service.getLatestRun()).toEqual({
        id: 9,
        createdAt,
        updatedAt: createdAt,
        finishedAt: createdAt,
        failedAt: null,
        matchingCount: 12,
      });
      expect(manager.find).toHaveBeenCalledWith(
        MatchingRun,
        expect.objectContaining({ order: { id: 'DESC' }, take: 1 }),
      );
      expect(manager.count).toHaveBeenCalledWith(Matching, {
        where: { matchingRunId: 9 },
      });
    });

    it('returns null when there is no successfully finished run yet', async () => {
      expect(await service.getLatestRun()).toBeNull();
      expect(manager.count).not.toHaveBeenCalled();
    });
  });

  describe('getNewestRun', () => {
    it('returns the newest run, whatever its status', async () => {
      const createdAt = new Date();
      manager.find?.mockResolvedValue([
        {
          id: 9,
          createdAt,
          updatedAt: createdAt,
          finishedAt: null,
          failedAt: null,
        },
      ]);
      manager.count?.mockResolvedValue(0);

      expect(await service.getNewestRun()).toEqual({
        id: 9,
        createdAt,
        updatedAt: createdAt,
        finishedAt: null,
        failedAt: null,
        matchingCount: 0,
      });
      expect(manager.find).toHaveBeenCalledWith(
        MatchingRun,
        expect.objectContaining({ order: { id: 'DESC' }, take: 1 }),
      );
    });

    it('returns null when there is no run yet', async () => {
      expect(await service.getNewestRun()).toBeNull();
      expect(manager.count).not.toHaveBeenCalled();
    });
  });

  describe('getRun', () => {
    it('returns a run by id, whatever its status', async () => {
      const createdAt = new Date();
      manager.find?.mockResolvedValue([
        {
          id: 7,
          createdAt,
          updatedAt: createdAt,
          finishedAt: null,
          failedAt: null,
        },
      ]);
      manager.count?.mockResolvedValue(3);

      expect(await service.getRun(7)).toEqual({
        id: 7,
        createdAt,
        updatedAt: createdAt,
        finishedAt: null,
        failedAt: null,
        matchingCount: 3,
      });
      expect(manager.find).toHaveBeenCalledWith(
        MatchingRun,
        expect.objectContaining({ where: { id: 7 } }),
      );
    });

    it('returns null when no run exists with that id', async () => {
      expect(await service.getRun(7)).toBeNull();
      expect(manager.count).not.toHaveBeenCalled();
    });
  });

  describe('getRunHistory', () => {
    const createRepository = (
      runs: unknown[],
      total: number,
      matchingCounts: Record<number, number> = {},
    ) => ({
      findAndCount: jest.fn().mockResolvedValue([runs, total]),
      manager: {
        count: jest.fn((_entity: unknown, options: unknown) =>
          Promise.resolve(
            matchingCounts[
              (options as { where: { matchingRunId: number } }).where
                .matchingRunId
            ] ?? 0,
          ),
        ),
      },
    });

    it('returns a page of the timestamps, status and matching count of past runs, newest first', async () => {
      const repository = createRepository(
        [
          {
            id: 9,
            createdAt: new Date('2026-09-29T10:00:00Z'),
            finishedAt: new Date('2026-09-29T10:05:00Z'),
            failedAt: null,
          },
          {
            id: 8,
            createdAt: new Date('2026-09-28T10:00:00Z'),
            finishedAt: null,
            failedAt: new Date('2026-09-28T10:05:00Z'),
          },
        ],
        2,
        { 9: 12, 8: 0 },
      );
      service = new MatchingsService(
        repository as unknown as Repository<MatchingRun>,
        membersService as unknown as MembersService,
        strategy,
      );

      expect(await service.getRunHistory(1, 20)).toEqual({
        items: [
          {
            id: 9,
            createdAt: new Date('2026-09-29T10:00:00Z'),
            finishedAt: new Date('2026-09-29T10:05:00Z'),
            failedAt: null,
            matchingCount: 12,
          },
          {
            id: 8,
            createdAt: new Date('2026-09-28T10:00:00Z'),
            finishedAt: null,
            failedAt: new Date('2026-09-28T10:05:00Z'),
            matchingCount: 0,
          },
        ],
        page: 1,
        pageSize: 20,
        total: 2,
      });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        order: { id: 'DESC' },
        skip: 0,
        take: 20,
      });
      expect(repository.manager.count).toHaveBeenCalledWith(Matching, {
        where: { matchingRunId: 9 },
      });
      expect(repository.manager.count).toHaveBeenCalledWith(Matching, {
        where: { matchingRunId: 8 },
      });
    });

    it('skips ahead for later pages', async () => {
      const repository = createRepository([], 45);
      service = new MatchingsService(
        repository as unknown as Repository<MatchingRun>,
        membersService as unknown as MembersService,
        strategy,
      );

      const result = await service.getRunHistory(3, 20);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        order: { id: 'DESC' },
        skip: 40,
        take: 20,
      });
      expect(result).toMatchObject({ page: 3, pageSize: 20, total: 45 });
    });

    it('caps the page size regardless of what is requested', async () => {
      const repository = createRepository([], 0);
      service = new MatchingsService(
        repository as unknown as Repository<MatchingRun>,
        membersService as unknown as MembersService,
        strategy,
      );

      await service.getRunHistory(1, 1000);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });

    it('clamps a page below 1 up to the first page', async () => {
      const repository = createRepository([], 0);
      service = new MatchingsService(
        repository as unknown as Repository<MatchingRun>,
        membersService as unknown as MembersService,
        strategy,
      );

      await service.getRunHistory(0, 20);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0 }),
      );
    });

    it('returns an empty page when there is no run yet', async () => {
      const repository = createRepository([], 0);
      service = new MatchingsService(
        repository as unknown as Repository<MatchingRun>,
        membersService as unknown as MembersService,
        strategy,
      );

      expect(await service.getRunHistory(1, 20)).toEqual({
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
      });
    });
  });
});
