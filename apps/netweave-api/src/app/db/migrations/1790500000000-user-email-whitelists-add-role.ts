import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEmailWhitelistsAddRole1790500000000
  implements MigrationInterface
{
  public name = 'UserEmailWhitelistsAddRole1790500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists"
            ADD "role" character varying NOT NULL DEFAULT 'viewer'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists" DROP COLUMN "role"
        `);
  }
}
