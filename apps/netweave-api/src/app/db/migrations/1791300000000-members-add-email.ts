import { MigrationInterface, QueryRunner } from 'typeorm';

export class MembersAddEmail1791300000000 implements MigrationInterface {
  public name = 'MembersAddEmail1791300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "members"
            ADD COLUMN "email" VARCHAR,
            ADD COLUMN "pending_email" VARCHAR,
            ADD COLUMN "email_change_token_hash" VARCHAR,
            ADD COLUMN "email_change_expires_at" TIMESTAMPTZ,
            ADD CONSTRAINT "UQ_members_email_change_token_hash" UNIQUE ("email_change_token_hash")
        `);
    // existing members take over the email of their invitation; should several share one, only the oldest gets it
    await queryRunner.query(`
            UPDATE "members" m SET "email" = s."email"
            FROM (
                SELECT DISTINCT ON (lower(i."email")) mm."id", i."email"
                FROM "members" mm
                JOIN "invitations" i ON i."id" = mm."invitation_id"
                ORDER BY lower(i."email"), mm."id"
            ) s
            WHERE m."id" = s."id"
        `);
    // one email per organization, regardless of case
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_members_email" ON "members" (lower("email"))
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "UQ_members_email"
        `);
    await queryRunner.query(`
            ALTER TABLE "members"
            DROP CONSTRAINT "UQ_members_email_change_token_hash",
            DROP COLUMN "email_change_expires_at",
            DROP COLUMN "email_change_token_hash",
            DROP COLUMN "pending_email",
            DROP COLUMN "email"
        `);
  }
}
