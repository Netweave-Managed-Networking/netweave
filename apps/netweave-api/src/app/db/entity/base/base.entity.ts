import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  declare public id: number;

  @CreateDateColumn({ name: 'created_at' })
  declare public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  declare public updatedAt: Date;
}
