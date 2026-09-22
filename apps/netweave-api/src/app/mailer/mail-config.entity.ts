import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { User } from '../users/user.entity';

/**
 * singleton-style table: the app only ever reads/writes the first row (ordered by id).
 * no row at all means "no admin override yet", MailerService then falls back to env vars.
 */
@Entity({ name: 'mail_config' })
export class MailConfig extends BaseEntity {
  @Column()
  declare public host: string;

  @Column()
  declare public port: number;

  @Column({ default: false })
  declare public secure: boolean;

  @Column({ name: 'auth_user', nullable: true })
  declare public authUser: string | null;

  @Column({ name: 'auth_pass_encrypted', nullable: true, select: false })
  declare public authPassEncrypted: string | null;

  @Column({ name: 'from_name' })
  declare public fromName: string;

  @Column({ name: 'from_address' })
  declare public fromAddress: string;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'updated_by_id' })
  declare public updatedBy: User | null;
}
