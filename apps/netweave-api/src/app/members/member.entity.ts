import { MemberDTO } from '@netweave/api-types';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';

@Entity({ name: 'members' })
export class Member extends BaseEntity implements MemberDTO {
  @Column()
  declare public name: string;

  @Column({ nullable: true, type: 'varchar' })
  declare public contact: string | null;
}
