import { MatchingDetailsDTO, MatchingDTO } from '@netweave/api-types';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { Member } from '../members/member.entity';
import { MatchingRun } from './matching-run.entity';

/** unidirectional: how well the potential match fits the seeker (0-100) */
@Entity({ name: 'matchings' })
@Unique('UQ_matchings_run_seeker_potential_match', [
  'matchingRunId',
  'memberSeekerId',
  'memberPotentialMatchId',
])
@Check('CHK_matchings_score', '"score" BETWEEN 0 AND 100')
export class Matching extends BaseEntity implements MatchingDTO {
  @Column({ name: 'matching_run_id' })
  declare public matchingRunId: number;

  @ManyToOne(() => MatchingRun, (run) => run.matchings, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'matching_run_id' })
  declare public matchingRun?: MatchingRun;

  @Index('IDX_matchings_member_seeker_id')
  @Column({ name: 'member_seeker_id' })
  declare public memberSeekerId: number;

  @ManyToOne(() => Member, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'member_seeker_id' })
  declare public memberSeeker?: Member;

  @Index('IDX_matchings_member_potential_match_id')
  @Column({ name: 'member_potential_match_id' })
  declare public memberPotentialMatchId: number;

  @ManyToOne(() => Member, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'member_potential_match_id' })
  declare public memberPotentialMatch?: Member;

  @Column({ type: 'smallint' })
  declare public score: number;

  @Column({ type: 'jsonb', nullable: true })
  declare public details: MatchingDetailsDTO | null;
}
