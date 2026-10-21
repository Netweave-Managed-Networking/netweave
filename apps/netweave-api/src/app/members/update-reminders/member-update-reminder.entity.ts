import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../db/entity/base/base.entity';
import { Member } from '../member.entity';

/** a sent mail asking the member to check its data; kept apart from the member, so sending it changes none of its data */
@Entity({ name: 'member_update_reminders' })
@Index('IDX_member_update_reminders_member_id', ['memberId'])
export class MemberUpdateReminder extends BaseEntity {
  @Column({ name: 'member_id' })
  declare public memberId: number;

  @ManyToOne(() => Member, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  declare public member: Member;

  /** the member's email at the time it was sent */
  @Column()
  declare public email: string;
}
