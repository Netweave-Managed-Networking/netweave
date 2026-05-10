import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';

@Entity({ name: 'organizations' })
export class Organization extends BaseEntity {
  @Column()
  declare oname: string;

  @Column({ nullable: true })
  declare contact: string;
}
