import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';

@Entity({ name: 'organizations' })
export class Organization extends BaseEntity {
  @Column()
  declare public name: string;

  @Column({ nullable: true })
  declare public contact: string;
}
