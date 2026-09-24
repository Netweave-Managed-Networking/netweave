import { UserDTO, UserRole } from '@netweave/api-types';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { Invitation } from '../invitations/invitation.entity';
import { UserEmailWhitelist } from '../user-email-whitelists/user-email-whitelist.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity implements UserDTO {
  @Column({ unique: true })
  declare public email: string;

  @Column({ select: false })
  declare public passwordHash: string;

  // SWC emits `Object` as design:type for imported type aliases, so TypeORM needs the type explicitly
  @Column({ type: 'varchar' })
  declare public role: UserRole;

  @OneToMany(
    () => UserEmailWhitelist,
    (userEmailWhitelist) => userEmailWhitelist.createdBy,
    { eager: false },
  )
  declare public userEmailWhitelistsCreated: UserEmailWhitelist[];

  @OneToMany(() => Invitation, (invitation) => invitation.invitedBy, {
    eager: false,
  })
  declare public invitationsSent: Invitation[];
}
