import { Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { Matching } from './matching.entity';

/** one calculation of all matchings; older runs are kept as history */
@Entity({ name: 'matching_runs' })
export class MatchingRun extends BaseEntity {
  @OneToMany(() => Matching, (matching) => matching.matchingRun)
  declare public matchings?: Matching[]; // only set when loaded as relation
}
