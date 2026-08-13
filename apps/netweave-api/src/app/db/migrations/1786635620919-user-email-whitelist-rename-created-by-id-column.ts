import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEmailWhitelistRenameCreatedByIdColumn1786635620919
  implements MigrationInterface
{
  public name = 'UserEmailWhitelistRenameCreatedByIdColumn1786635620919';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists" DROP CONSTRAINT "FK_8c1f70d4791cdf987e1db279add"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists"
                RENAME COLUMN "createdById" TO "created_by_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists"
            ADD CONSTRAINT "FK_809d4a72948f45f403934f83845" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists" DROP CONSTRAINT "FK_809d4a72948f45f403934f83845"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists"
                RENAME COLUMN "created_by_id" TO "createdById"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists"
            ADD CONSTRAINT "FK_8c1f70d4791cdf987e1db279add" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }
}
