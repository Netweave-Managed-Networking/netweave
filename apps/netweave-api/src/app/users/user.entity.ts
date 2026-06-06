import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  declare public email: string;

  @Column()
  declare public passwordHash: string;

  @Column()
  declare public role: 'admin' | 'editor' | 'viewer';
}
