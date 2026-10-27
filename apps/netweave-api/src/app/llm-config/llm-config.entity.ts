import type { LlmProvider } from '@netweave/api-types';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../db/entity/base/base.entity';
import { User } from '../users/user.entity';

/** single row table, no row means the netweave llm access (LLM_* env vars) is used */
@Entity({ name: 'llm_config' })
export class LlmConfig extends BaseEntity {
  @Column({ type: 'varchar' })
  declare public provider: LlmProvider;

  @Column()
  declare public model: string;

  @Column({ name: 'base_url', type: 'varchar', nullable: true })
  declare public baseUrl: string | null;

  @Column({
    name: 'api_key_encrypted',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  declare public apiKeyEncrypted: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'updated_by_id' })
  declare public updatedBy: User | null;
}
