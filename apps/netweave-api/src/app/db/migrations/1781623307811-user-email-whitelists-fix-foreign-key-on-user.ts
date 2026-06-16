import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEmailWhitelistsFixForeignKeyOnUser1781623307811
  implements MigrationInterface
{
  public name = 'UserEmailWhitelistsFixForeignKeyOnUser1781623307811';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists" DROP CONSTRAINT "FK_8c1f70d4791cdf987e1db279add"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists"
            ADD CONSTRAINT "UQ_8eb4c03374af36364fee46f7469" UNIQUE ("email_or_domain")
        `);
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists"
            ALTER COLUMN "createdById"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists"
            ADD CONSTRAINT "FK_8c1f70d4791cdf987e1db279add" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists" DROP CONSTRAINT "FK_8c1f70d4791cdf987e1db279add"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists"
            ALTER COLUMN "createdById" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists" DROP CONSTRAINT "UQ_8eb4c03374af36364fee46f7469"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists"
            ADD CONSTRAINT "FK_8c1f70d4791cdf987e1db279add" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
