import { UserDTO } from '@netweave/api-types';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { UserEmailWhitelist } from '../user-email-whitelists/user-email-whitelist.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity implements UserDTO {
  @Column({ unique: true })
  declare public email: string;

  @Column()
  declare public passwordHash: string;

  @Column()
  declare public role: 'admin' | 'editor' | 'viewer';

  @OneToMany(
    () => UserEmailWhitelist,
    (userEmailWhitelist) => userEmailWhitelist.createdBy,
  )
  declare public userEmailWhitelistsCreated: UserEmailWhitelist[];
}
