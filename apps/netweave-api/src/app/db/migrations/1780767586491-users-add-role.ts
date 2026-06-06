import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersAddRole1780767586491 implements MigrationInterface {
  public name = 'UsersAddRole1780767586491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "role" character varying NOT NULL DEFAULT 'editor'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "role"
        `);
  }
}
