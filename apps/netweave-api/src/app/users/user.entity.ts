import { UserDTO } from '@netweave/api-types';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity implements UserDTO {
  @Column({ unique: true })
  declare public email: string;

  @Column()
  declare public passwordHash: string;

  @Column()
  declare public role: 'admin' | 'editor' | 'viewer';
}
