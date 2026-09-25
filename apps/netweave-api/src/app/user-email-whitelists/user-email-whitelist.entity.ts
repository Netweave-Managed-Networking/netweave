import {
  DEFAULT_USER_ROLE,
  UserEmailWhitelistDTO,
  UserRole,
} from '@netweave/api-types';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'user-email-whitelists' })
export class UserEmailWhitelist
  extends BaseEntity
  implements UserEmailWhitelistDTO
{
  @Column({ name: 'email_or_domain', unique: true })
  declare public emailOrDomain: string;

  // SWC emits `Object` as design:type for imported type aliases, so TypeORM needs the type explicitly
  @Column({ type: 'varchar', default: DEFAULT_USER_ROLE })
  declare public role: UserRole;

  @ManyToOne(() => User, (user) => user.userEmailWhitelistsCreated, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'created_by_id' })
  declare public createdBy: User;
}
