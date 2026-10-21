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

  /** null until the user clicked the link in the confirmation mail; unverified users cannot log in */
  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
  declare public emailVerifiedAt: Date | null;

  /** sha256 of the token in the confirmation link, so a leaked db row cannot be used to log in */
  @Column({
    name: 'email_verification_token_hash',
    type: 'varchar',
    unique: true,
    nullable: true,
    select: false,
  })
  declare public emailVerificationTokenHash: string | null;

  @Column({
    name: 'email_verification_expires_at',
    type: 'timestamptz',
    nullable: true,
    select: false,
  })
  declare public emailVerificationExpiresAt: Date | null;

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
