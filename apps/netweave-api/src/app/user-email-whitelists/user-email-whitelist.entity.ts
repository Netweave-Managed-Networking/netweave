import { UserEmailWhitelistDTO } from '@netweave/api-types';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'user-email-whitelists' })
export class UserEmailWhitelist
  extends BaseEntity
  implements UserEmailWhitelistDTO
{
  @Column({ name: 'email_or_domain', unique: true })
  declare public emailOrDomain: string;

  @ManyToOne(() => User, (user) => user.userEmailWhitelistsCreated, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  declare public createdBy: User;
}
