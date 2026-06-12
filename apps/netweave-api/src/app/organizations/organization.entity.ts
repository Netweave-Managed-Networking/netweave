import { OrganizationDTO } from '@netweave/api-types';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';

@Entity({ name: 'organizations' })
export class Organization extends BaseEntity implements OrganizationDTO {
  @Column()
  declare public name: string;

  @Column({ nullable: true, type: 'varchar' })
  declare public contact: string | null;
}
