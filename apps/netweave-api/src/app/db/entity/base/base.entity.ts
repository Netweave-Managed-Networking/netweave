// src/common/base.entity.ts
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  declare id: number;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: Date;
}
