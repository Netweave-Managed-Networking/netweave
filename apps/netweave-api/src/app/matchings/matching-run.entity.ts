import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { Matching } from './matching.entity';

/** one calculation of all matchings; older runs are kept as history */
@Entity({ name: 'matching_runs' })
export class MatchingRun extends BaseEntity {
  @Column({ name: 'finished_at', type: 'timestamp', nullable: true })
  declare public finishedAt: Date | null; // null while the run is still calculating

  @OneToMany(() => Matching, (matching) => matching.matchingRun)
  declare public matchings?: Matching[]; // only set when loaded as relation
}
