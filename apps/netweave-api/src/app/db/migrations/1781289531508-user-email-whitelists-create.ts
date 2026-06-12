import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEmailWhitelistsCreate1781289531508
  implements MigrationInterface
{
  public name = 'UserEmailWhitelistsCreate1781289531508';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user-email-whitelists" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "email_or_domain" character varying NOT NULL,
                "createdById" integer,
                CONSTRAINT "PK_c85f29396ff8606375dd4bd0dc9" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists"
            ADD CONSTRAINT "FK_8c1f70d4791cdf987e1db279add" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user-email-whitelists" DROP CONSTRAINT "FK_8c1f70d4791cdf987e1db279add"
        `);
    await queryRunner.query(`
            DROP TABLE "user-email-whitelists"
        `);
  }
}
