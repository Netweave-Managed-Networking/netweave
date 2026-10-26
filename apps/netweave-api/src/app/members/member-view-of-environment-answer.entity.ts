import { LikertAnswer, ViewOfEnvironmentItemId } from '@netweave/api-types';
import { Check, Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { Member } from './member.entity';

/** the answer as given; texts and reversal of the questions are hardcoded, see VIEW_OF_ENVIRONMENT_REVERSED_ITEM_IDS */
@Entity({ name: 'member_view_of_environment_answers' })
@Unique('UQ_member_view_of_environment_answers_member_id_item_id', [
  'memberId',
  'itemId',
])
@Check(
  'CHK_member_view_of_environment_answers_answer',
  '"answer" BETWEEN 0 AND 4',
)
export class MemberViewOfEnvironmentAnswer extends BaseEntity {
  // explicit column (next to the relation) so it can serve as upsert conflict target
  @Column({ name: 'member_id' })
  declare public memberId: number;

  @ManyToOne(() => Member, (member) => member.viewOfEnvironmentAnswers, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  declare public member: Member;

  @Column({ name: 'item_id', type: 'varchar' })
  declare public itemId: ViewOfEnvironmentItemId;

  @Column({ type: 'smallint' })
  declare public answer: LikertAnswer;
}
