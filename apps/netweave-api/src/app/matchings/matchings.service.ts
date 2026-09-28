import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchingRunDTO } from '@netweave/api-types';
import { EntityManager, Repository } from 'typeorm';
import { MembersService } from '../members/members.service';
import { hasAnswers } from './matching-input';
import { MatchingRun } from './matching-run.entity';
import { MATCHING_STRATEGY, MatchingStrategy } from './matching-strategy';
import { Matching } from './matching.entity';

const INSERT_CHUNK_SIZE = 1000; // keeps a single insert statement well below postgres' parameter limit
const RUN_LOCK_KEY = 1_853_060_205; // arbitrary, but unique app wide id of the postgres advisory lock that guards matching runs

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

  @Cron(process.env.MATCHING_CRON_SCHEDULE ?? '0 * * * *') // MATCHING_CRON_SCHEDULE or default: every hour
  public async calculateScheduled(): Promise<void> {
    try {
      await this.calculateAll();
    } catch (error) {
      this.logger.error('Failed to calculate matchings', error);
    }
  }

  public async getLatestRun(): Promise<MatchingRunDTO | null> {
    const manager = this.matchingRunsRepository.manager;
    const latest = await findLatestRun(manager);
    if (!latest) return null;

    const matchingCount = await manager.count(Matching, {
      where: { matchingRunId: latest.id },
    });
    return toMatchingRunDTO(latest, matchingCount);
  }

  /**
   * calculates the score from every member to every other member and stores them as a new run.
   * members without any answers are left out. unless forced, nothing is calculated when no resource or requirement changed since the last run.
   * returns null if a run is already in progress (in any api instance) or was skipped.
   */
  public async calculateAll({
    force = false,
  } = {}): Promise<MatchingRunDTO | null> {
    // all or nothing: never leave a half-filled run behind
    return this.matchingRunsRepository.manager.transaction(async (manager) => {
      // released automatically when the transaction ends, also on errors
      const [{ locked }] = await manager.query(
        'SELECT pg_try_advisory_xact_lock($1) AS locked',
        [RUN_LOCK_KEY],
      );
      if (!locked) {
        this.logger.warn('Another matching run is in progress, skipping');
        return null;
      }

      const members = (
        await this.membersService.getAllWithResourcesRequirements()
      ).filter(hasAnswers);

      const latest = await findLatestRun(manager);
      if (
        !force &&
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

      const run = await manager.save(manager.create(MatchingRun));
      for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
        await manager.insert(
          Matching,
          rows
            .slice(i, i + INSERT_CHUNK_SIZE)
            .map((row) => ({ ...row, matchingRunId: run.id })),
        );
      }
      run.finishedAt = new Date();
      await manager.save(run);

      this.logger.log(
        `Matching run ${run.id}: ${rows.length} matchings for ${members.length} members`,
      );
      return toMatchingRunDTO(run, rows.length);
    });
  }
}

const findLatestRun = async (
  manager: EntityManager,
): Promise<MatchingRun | null> => {
  const [latest] = await manager.find(MatchingRun, {
    order: { id: 'DESC' },
    take: 1,
  });
  return latest ?? null;
};

const toMatchingRunDTO = (
  { id, createdAt, updatedAt, finishedAt }: MatchingRun,
  matchingCount: number,
): MatchingRunDTO => ({ id, createdAt, updatedAt, finishedAt, matchingCount });
