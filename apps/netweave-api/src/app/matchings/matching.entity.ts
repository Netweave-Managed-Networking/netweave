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

/** unidirectional: how well the target member matches the source member (0-100) */
@Entity({ name: 'matchings' })
@Unique('UQ_matchings_run_source_target', [
  'matchingRunId',
  'sourceMemberId',
  'targetMemberId',
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

  @Index('IDX_matchings_source_member_id')
  @Column({ name: 'source_member_id' })
  declare public sourceMemberId: number;

  @ManyToOne(() => Member, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'source_member_id' })
  declare public sourceMember?: Member;

  @Index('IDX_matchings_target_member_id')
  @Column({ name: 'target_member_id' })
  declare public targetMemberId: number;

  @ManyToOne(() => Member, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'target_member_id' })
  declare public targetMember?: Member;

  @Column({ type: 'smallint' })
  declare public score: number;

  @Column({ type: 'jsonb', nullable: true })
  declare public details: MatchingDetailsDTO | null;
}
