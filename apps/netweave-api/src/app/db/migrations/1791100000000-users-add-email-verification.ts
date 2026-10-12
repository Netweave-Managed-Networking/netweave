import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersAddEmailVerification1791100000000
  implements MigrationInterface
{
  public name = 'UsersAddEmailVerification1791100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "email_verified_at" TIMESTAMPTZ,
            ADD COLUMN "email_verification_token_hash" VARCHAR UNIQUE,
            ADD COLUMN "email_verification_expires_at" TIMESTAMPTZ
        `);
    // users registered before email verification existed must not be locked out
    await queryRunner.query(`
            UPDATE "users" SET "email_verified_at" = now()
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "email_verification_expires_at",
            DROP COLUMN "email_verification_token_hash",
            DROP COLUMN "email_verified_at"
        `);
  }
}
