import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { Matching } from './matching.entity';

/** one calculation of all matchings; older runs are kept as history */
@Entity({ name: 'matching_runs' })
export class MatchingRun extends BaseEntity {
  /** fingerprint of the input, to skip runs that would not change anything */
  @Column({ name: 'input_hash', type: 'varchar', length: 64, nullable: true })
  declare public inputHash: string | null;

  @OneToMany(() => Matching, (matching) => matching.matchingRun)
  declare public matchings?: Matching[]; // only set when loaded as relation
}
