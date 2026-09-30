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

  @OneToMany(() => Matching, (matching) => matching.matchingRun)
  declare public matchings?: Matching[]; // only set when loaded as relation
}
