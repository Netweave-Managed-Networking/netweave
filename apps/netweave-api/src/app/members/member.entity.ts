import { MemberDTO } from '@netweave/api-types';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { Invitation } from '../invitations/invitation.entity';
import { MemberCultureWeight } from './member-culture-weight.entity';
import { MemberResourceRequirement } from './member-resource-requirement.entity';

@Entity({ name: 'members' })
export class Member extends BaseEntity implements MemberDTO {
  @Column()
  declare public name: string;

  @Column({ nullable: true, type: 'varchar' })
  declare public contact: string | null;

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
}
