import { MemberDTO } from '@netweave/api-types';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { Invitation } from '../invitations/invitation.entity';
import { MemberCultureWeight } from './member-culture-weight.entity';
import { MemberResourceRequirement } from './member-resource-requirement.entity';
import { MemberViewOfEnvironmentAnswer } from './member-view-of-environment-answer.entity';

@Entity({ name: 'members' })
export class Member extends BaseEntity implements MemberDTO {
  @Column()
  declare public name: string;

  @Column({ nullable: true, type: 'varchar' })
  declare public contact: string | null;

  /**
   * where Netweave reaches the member; starts as the invitation's email, which itself is kept as sent.
   * unique regardless of case (index UQ_members_email on lower(email), see migration).
   * null only for members whose invitation was deleted before this column existed
   */
  @Column({ type: 'varchar', nullable: true })
  declare public email: string | null;

  /** requested new email, replaces `email` once confirmed via the link mailed to it */
  @Column({ name: 'pending_email', type: 'varchar', nullable: true })
  declare public pendingEmail: string | null;

  @Column({
    name: 'email_change_token_hash',
    type: 'varchar',
    unique: true,
    nullable: true,
    select: false,
  })
  declare public emailChangeTokenHash: string | null;

  @Column({
    name: 'email_change_expires_at',
    type: 'timestamptz',
    nullable: true,
    select: false,
  })
  declare public emailChangeExpiresAt: Date | null;

  @OneToOne(() => Invitation, (invitation) => invitation.member, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'invitation_id' })
  declare public invitation: Invitation | null;

  @OneToMany(
    () => MemberResourceRequirement,
    (resourceRequirement) => resourceRequirement.member,
  )
  declare public resourcesRequirements?: MemberResourceRequirement[]; // only set when loaded as relation

  @OneToMany(() => MemberCultureWeight, (cultureWeight) => cultureWeight.member)
  declare public cultureWeights?: MemberCultureWeight[]; // only set when loaded as relation

  @OneToMany(() => MemberViewOfEnvironmentAnswer, (answer) => answer.member)
  declare public viewOfEnvironmentAnswers?: MemberViewOfEnvironmentAnswer[]; // only set when loaded as relation
}
