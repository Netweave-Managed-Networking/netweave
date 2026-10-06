import { CultureItemId } from '@netweave/api-types';
import { Check, Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { Member } from './member.entity';

/** normalized weight = weight / topicTotal, stored as fraction to stay exact */
@Entity({ name: 'member_culture_weights' })
@Unique('UQ_member_culture_weights_member_id_item_id', ['memberId', 'itemId'])
@Check('CHK_member_culture_weights_weight', '"weight" >= 0')
@Check('CHK_member_culture_weights_topic_total', '"topic_total" > 0')
export class MemberCultureWeight extends BaseEntity {
  // explicit column (next to the relation) so it can serve as upsert conflict target
  @Column({ name: 'member_id' })
  declare public memberId: number;

  @ManyToOne(() => Member, (member) => member.cultureWeights, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  declare public member: Member;

  @Column({ name: 'item_id', type: 'varchar' })
  declare public itemId: CultureItemId;

  @Column({ type: 'integer' })
  declare public weight: number;

  @Column({ name: 'topic_total', type: 'integer' })
  declare public topicTotal: number;
}
