import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchingRunDTO, MatchingRunListItemDTO } from '@netweave/api-types';
import {
  EntityManager,
  FindOptionsWhere,
  IsNull,
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
const STALE_RUN_THRESHOLD_MS = 60 * 60 * 1000; // generously longer than any realistic run; recovers from a run whose process crashed/restarted mid-computation, which would otherwise stay "in progress" forever and block every future run

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

  /** timestamps of past runs, newest first; includes in-progress and failed runs */
  public async getRunHistory(): Promise<MatchingRunListItemDTO[]> {
    const runs = await this.matchingRunsRepository.find({
      order: { id: 'DESC' },
    });
    return runs.map(({ id, createdAt, finishedAt, failedAt }) => ({
      id,
      createdAt,
      finishedAt,
      failedAt,
    }));
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

      const inProgress = await manager.findOneBy(MatchingRun, {
        finishedAt: IsNull(),
        failedAt: IsNull(),
      });
      if (inProgress) {
        const isStale =
          Date.now() - inProgress.createdAt.getTime() > STALE_RUN_THRESHOLD_MS;
        if (!isStale) {
          this.logger.warn('Another matching run is in progress, skipping');
          return null;
        }
        // the process that ran it presumably crashed or restarted before finishing; never leave it stuck forever
        this.logger.warn(
          `Matching run ${inProgress.id} has been in progress since ${inProgress.createdAt.toISOString()}, treating it as failed`,
        );
        await manager.update(MatchingRun, inProgress.id, {
          failedAt: new Date(),
        });
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

  /**
   * calculates the score from every member to every other member and stores them against the given run.
   * members without any answers are left out. inserted in chunks, each committed on its own, so a failure
   * midway leaves the completed chunks in place and marks the run as failed instead of rolling everything back.
   */
  private async computeAndPersist(run: MatchingRun): Promise<number> {
    const manager = this.matchingRunsRepository.manager;
    try {
      const members = (
        await this.membersService.getAllWithResourcesRequirements()
      ).filter(hasAnswers);

      const rows: Pick<
        Matching,
        'memberSeekerId' | 'memberPotentialMatchId' | 'score' | 'details'
      >[] = [];
      for (const seeker of members) {
        for (const potentialMatch of members) {
          if (seeker.id === potentialMatch.id) continue;
          const { score, details } = await this.matchingStrategy.score(
            seeker,
            potentialMatch,
          );
          rows.push({
            memberSeekerId: seeker.id,
            memberPotentialMatchId: potentialMatch.id,
            score,
            details,
          });
        }
      }

      for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
        await manager.insert(
          Matching,
          rows
            .slice(i, i + INSERT_CHUNK_SIZE)
            .map((row) => ({ ...row, matchingRunId: run.id })),
        );
      }

      await this.markRunDone(manager, run.id, { finishedAt: new Date() });
      return rows.length;
    } catch (error) {
      await this.markRunDone(manager, run.id, { failedAt: new Date() });
      throw error;
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
