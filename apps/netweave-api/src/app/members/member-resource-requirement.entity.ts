import { ResourceRequirementCategory } from '@netweave/api-types';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { Member } from './member.entity';

@Entity({ name: 'member_resources_requirements' })
@Unique('UQ_member_resources_requirements_member_id_category', [
  'memberId',
  'category',
])
export class MemberResourceRequirement extends BaseEntity {
  // explicit column (next to the relation) so it can serve as upsert conflict target
  @Column({ name: 'member_id' })
  declare public memberId: number;

  @ManyToOne(() => Member, (member) => member.resourcesRequirements, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  declare public member: Member;

  @Column({ type: 'varchar' })
  declare public category: ResourceRequirementCategory;

  @Column({ nullable: true, type: 'text' })
  declare public resources: string | null;

  @Column({ nullable: true, type: 'text' })
  declare public requirements: string | null;
}
