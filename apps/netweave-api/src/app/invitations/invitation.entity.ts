import { InvitationDTO, InvitationStatus } from '@netweave/api-types';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { Member } from '../members/member.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'invitations' })
export class Invitation extends BaseEntity implements InvitationDTO {
  @Column()
  declare public email: string;

  @Column({
    name: 'expire_date',
    type: 'timestamp',
    default: () => `now() + interval '3 months'`,
  })
  declare public expireDate: Date;

  @Column({ name: 'answered_date', type: 'timestamp', nullable: true })
  declare public answeredDate: Date | null;

  @Column({ unique: true, select: false })
  declare public token: string;

  @Column({ type: 'varchar', default: 'pending' })
  declare public status: InvitationStatus;

  @ManyToOne(() => User, (user) => user.invitationsSent, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'invited_by_id' })
  declare public invitedBy: User;

  @OneToOne(() => Member, (member) => member.invitation, { eager: false })
  declare public member?: Member | null;
}
