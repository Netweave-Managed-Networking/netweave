import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersRenameTable1780949556090 implements MigrationInterface {
  public name = 'UsersRenameTable1780949556090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" RENAME TO "users"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" RENAME TO "user"`);
  }
}
