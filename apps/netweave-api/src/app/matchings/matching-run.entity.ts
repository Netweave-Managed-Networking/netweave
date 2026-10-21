import { RecommendationsDTO } from '@netweave/api-types';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { Matching } from './matching.entity';

/** one calculation of all matchings; older runs are kept as history */
@Entity({ name: 'matching_runs' })
export class MatchingRun extends BaseEntity {
  // timestamptz, not timestamp: these are set from application code, and a plain timestamp column silently
  // drops the timezone offset on write
  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  declare public finishedAt: Date | null; // null while the run is still calculating

  @Column({ name: 'failed_at', type: 'timestamptz', nullable: true })
  declare public failedAt: Date | null; // set instead of finishedAt if the run errored out

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  declare public cancelledAt: Date | null; // set instead of finishedAt if a user cancelled the run

  @Column({ name: 'ranking_strategy', type: 'varchar', nullable: true })
  declare public rankingStrategy: string | null; // null for runs from before the ranking

  // not selected by default, as it grows with the number of members
  @Column({ type: 'jsonb', nullable: true, select: false })
  declare public recommendations?: RecommendationsDTO | null; // set when the run finishes

  @OneToMany(() => Matching, (matching) => matching.matchingRun)
  declare public matchings?: Matching[]; // only set when loaded as relation
}
