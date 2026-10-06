import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MatchingRunDTO,
  MatchingRunListItemDTO,
  PaginatedDTO,
} from '@netweave/api-types';
import {
  EntityManager,
  FindOptionsWhere,
  IsNull,
  LessThan,
  Not,
  Repository,
} from 'typeorm';
import { MembersService } from '../members/members.service';
import { hasAnswers } from './matching-input';
import { MatchingRun } from './matching-run.entity';
import { MATCHING_STRATEGY, MatchingStrategy } from './matching-strategy';
import { Matching } from './matching.entity';

const INSERT_CHUNK_SIZE = 1000; // keeps a single insert statement well below postgres' parameter limit
const RUN_LOCK_KEY = 1_853_060_205; // arbitrary, but unique app wide id of the postgres advisory lock that guards matching runs
const HEARTBEAT_INTERVAL_MS = 30 * 1000;
const STALE_RUN_THRESHOLD_MS = 3 * 60 * 1000; // run without heartbeat counts as crashed
const MAX_HISTORY_PAGE_SIZE = 100; // caps what a client can request per page, regardless of the requested pageSize

@Injectable()
export class MatchingsService {
  private readonly logger = new Logger(MatchingsService.name);

  public constructor(
    @InjectRepository(MatchingRun)
    private matchingRunsRepository: Repository<MatchingRun>,
    private membersService: MembersService,
    @Inject(MATCHING_STRATEGY)
    private matchingStrategy: MatchingStrategy,
  ) {
    this.logger.log(`MatchingsService initialized`);
  }

  @Cron(process.env.MATCHING_COMPUTATION_CRON_SCHEDULE ?? '0 0 * * 0') // MATCHING_COMPUTATION_CRON_SCHEDULE or default: once a week, Sunday midnight
  public async calculateScheduled(): Promise<void> {
    try {
      const run = await this.beginRun(false);
      if (!run) return;
      const matchingCount = await this.computeAndPersist(run);
      this.logger.log(`Matching run ${run.id}: ${matchingCount} matchings`);
    } catch (error) {
      this.logger.error('Failed to calculate matchings', error);
    }
  }

  /**
   * starts a forced matching run in the background and returns right away with its (still empty) summary.
   * returns null if a run is already in progress (in any api instance).
   */
  public async triggerRun(): Promise<MatchingRunDTO | null> {
    const run = await this.beginRun(true);
    if (!run) return null;

    this.computeAndPersist(run)
      .then((matchingCount) =>
        this.logger.log(`Matching run ${run.id}: ${matchingCount} matchings`),
      )
      .catch((error) =>
        this.logger.error(`Matching run ${run.id} failed`, error),
      );

    return toMatchingRunDTO(run, 0);
  }

  /** the most recently *successfully finished* run; in-progress or failed runs never show up here */
  public async getLatestRun(): Promise<MatchingRunDTO | null> {
    return this.findMatchingRunDTO({ finishedAt: Not(IsNull()) });
  }

  /** the newest run, whatever its status; used to detect an in-progress run, e.g. right after a page reload */
  public async getNewestRun(): Promise<MatchingRunDTO | null> {
    return this.findMatchingRunDTO({});
  }

  /** a single run by id, whatever its status, for polling a run that was just triggered */
  public async getRun(id: number): Promise<MatchingRunDTO | null> {
    return this.findMatchingRunDTO({ id });
  }

  private async findMatchingRunDTO(
    where: FindOptionsWhere<MatchingRun>,
  ): Promise<MatchingRunDTO | null> {
    const manager = this.matchingRunsRepository.manager;
    await this.reapStaleRuns(manager);
    const [run] = await manager.find(MatchingRun, {
      where,
      order: { id: 'DESC' },
      take: 1,
    });
    if (!run) return null;

    const matchingCount = await manager.count(Matching, {
      where: { matchingRunId: run.id },
    });
    return toMatchingRunDTO(run, matchingCount);
  }

  /**
   * timestamps of past runs, newest first, paginated; includes in-progress and failed runs.
   * page is 1-based; pageSize is capped at MAX_HISTORY_PAGE_SIZE regardless of what is requested.
   */
  public async getRunHistory(
    page: number,
    pageSize: number,
  ): Promise<PaginatedDTO<MatchingRunListItemDTO>> {
    const clampedPage = Math.max(page, 1);
    const clampedPageSize = Math.min(
      Math.max(pageSize, 1),
      MAX_HISTORY_PAGE_SIZE,
    );

    await this.reapStaleRuns(this.matchingRunsRepository.manager);
    const [runs, total] = await this.matchingRunsRepository.findAndCount({
      order: { id: 'DESC' },
      skip: (clampedPage - 1) * clampedPageSize,
      take: clampedPageSize,
    });

    const manager = this.matchingRunsRepository.manager;
    const items = await Promise.all(
      runs.map(async ({ id, createdAt, finishedAt, failedAt }) => ({
        id,
        createdAt,
        finishedAt,
        failedAt,
        matchingCount: await manager.count(Matching, {
          where: { matchingRunId: id },
        }),
      })),
    );

    return {
      items,
      page: clampedPage,
      pageSize: clampedPageSize,
      total,
    };
  }

  /**
   * acquires the run lock and creates a new, empty run row, in one short transaction.
   * unless forced, nothing is created when no resource or requirement changed since the last successful run.
   * returns null if a run is already in progress (in any api instance) or was skipped; never runs the actual
   * (potentially long) computation itself, see computeAndPersist.
   */
  private async beginRun(force: boolean): Promise<MatchingRun | null> {
    return this.matchingRunsRepository.manager.transaction(async (manager) => {
      // released automatically when the transaction ends, also on errors; only serializes concurrent begins,
      // it is intentionally not held for the whole computation, see computeAndPersist
      const [{ locked }] = await manager.query(
        'SELECT pg_try_advisory_xact_lock($1) AS locked',
        [RUN_LOCK_KEY],
      );
      if (!locked) {
        this.logger.warn('Another matching run is in progress, skipping');
        return null;
      }

      await this.reapStaleRuns(manager);
      const inProgress = await manager.findOneBy(MatchingRun, {
        finishedAt: IsNull(),
        failedAt: IsNull(),
      });
      if (inProgress) {
        this.logger.warn('Another matching run is in progress, skipping');
        return null;
      }

      if (!force) {
        const latest = await findLatestFinishedRun(manager);
        if (
          latest &&
          !(await this.membersService.haveResourcesRequirementsChangedSince(
            latest.createdAt,
          ))
        ) {
          this.logger.log(
            'Nothing changed since the last matching run, skipping',
          );
          return null;
        }
      }

      return manager.save(manager.create(MatchingRun));
    });
  }

  /** scores every member against every other one; scores are persisted per seeker, so a failure keeps completed ones */
  private async computeAndPersist(run: MatchingRun): Promise<number> {
    const manager = this.matchingRunsRepository.manager;
    const abort = new AbortController();
    const heartbeat = setInterval(
      () => void this.heartbeat(manager, run.id, abort),
      HEARTBEAT_INTERVAL_MS,
    );
    try {
      const members = (
        await this.membersService.getAllWithResourcesRequirements()
      ).filter(hasAnswers);

      let matchingCount = 0;
      for (const seeker of members) {
        abort.signal.throwIfAborted();
        const potentialMatches = members.filter((m) => m.id !== seeker.id);
        const results = await Promise.all(
          potentialMatches.map((potentialMatch) =>
            this.matchingStrategy.score(seeker, potentialMatch, abort.signal),
          ),
        );
        const rows = potentialMatches.map((potentialMatch, i) => ({
          matchingRunId: run.id,
          memberSeekerId: seeker.id,
          memberPotentialMatchId: potentialMatch.id,
          score: results[i].score,
          details: results[i].details,
        }));

        for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
          await manager.insert(Matching, rows.slice(i, i + INSERT_CHUNK_SIZE));
        }
        matchingCount += rows.length;
      }

      await this.markRunDone(manager, run.id, { finishedAt: new Date() });
      return matchingCount;
    } catch (error) {
      abort.abort(error);
      await this.markRunDone(manager, run.id, { failedAt: new Date() });
      throw error;
    } finally {
      clearInterval(heartbeat);
    }
  }

  /** aborts the computation if the run was reaped meanwhile */
  private async heartbeat(
    manager: EntityManager,
    runId: number,
    abort: AbortController,
  ): Promise<void> {
    try {
      const { affected } = await manager.update(
        MatchingRun,
        { id: runId, finishedAt: IsNull(), failedAt: IsNull() },
        { updatedAt: new Date() },
      );
      if (!affected) {
        abort.abort(
          new Error(
            `Matching run ${runId} was reaped as stale while still calculating; aborting it`,
          ),
        );
      }
    } catch (error) {
      this.logger.warn(`Heartbeat of matching run ${runId} failed`, error);
    }
  }

  /** marks in-progress runs without a recent heartbeat as failed */
  private async reapStaleRuns(manager: EntityManager): Promise<void> {
    const { affected } = await manager.update(
      MatchingRun,
      {
        finishedAt: IsNull(),
        failedAt: IsNull(),
        updatedAt: LessThan(new Date(Date.now() - STALE_RUN_THRESHOLD_MS)),
      },
      { failedAt: new Date() },
    );
    if (affected) {
      this.logger.warn(
        `Marked ${affected} matching run(s) without heartbeat for ${STALE_RUN_THRESHOLD_MS / 1000}s as failed`,
      );
    }
  }

  /**
   * marks a run finished or failed, but never overwrites a run that beginRun already reaped as stale (and
   * possibly replaced with a new run) while this computation was still going: that would otherwise leave the
   * row with both finishedAt and failedAt set, from two computations that ran concurrently against it.
   */
  private async markRunDone(
    manager: EntityManager,
    runId: number,
    patch: Pick<MatchingRun, 'finishedAt'> | Pick<MatchingRun, 'failedAt'>,
  ): Promise<void> {
    const { affected } = await manager.update(
      MatchingRun,
      { id: runId, failedAt: IsNull() },
      patch,
    );

    if (!affected) {
      this.logger.warn(
        `Matching run ${runId} was already reaped as stale before it finished; discarding its result`,
      );
    }
  }
}

const findLatestFinishedRun = async (
  manager: EntityManager,
): Promise<MatchingRun | null> => {
  const [latest] = await manager.find(MatchingRun, {
    where: { finishedAt: Not(IsNull()) },
    order: { id: 'DESC' },
    take: 1,
  });
  return latest ?? null;
};

const toMatchingRunDTO = (
  { id, createdAt, updatedAt, finishedAt, failedAt }: MatchingRun,
  matchingCount: number,
): MatchingRunDTO => ({
  id,
  createdAt,
  updatedAt,
  finishedAt,
  failedAt,
  matchingCount,
});
