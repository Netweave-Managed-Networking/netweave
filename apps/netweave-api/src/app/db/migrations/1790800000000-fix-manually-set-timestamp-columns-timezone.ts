import { MigrationInterface, QueryRunner } from 'typeorm';

/** finished_at/failed_at/expire_date/answered_date are set from application code, not a DB-side default like
 * created_at/updated_at, so a plain timestamp column silently drops the timezone offset on write */
export class FixManuallySetTimestampColumnsTimezone1790800000000
  implements MigrationInterface
{
  public name = 'FixManuallySetTimestampColumnsTimezone1790800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "matching_runs" ALTER COLUMN "finished_at" TYPE TIMESTAMPTZ
        `);
    await queryRunner.query(`
            ALTER TABLE "matching_runs" ALTER COLUMN "failed_at" TYPE TIMESTAMPTZ
        `);
    await queryRunner.query(`
            ALTER TABLE "invitations" ALTER COLUMN "expire_date" TYPE TIMESTAMPTZ
        `);
    await queryRunner.query(`
            ALTER TABLE "invitations" ALTER COLUMN "answered_date" TYPE TIMESTAMPTZ
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "matching_runs" ALTER COLUMN "finished_at" TYPE TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "matching_runs" ALTER COLUMN "failed_at" TYPE TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "invitations" ALTER COLUMN "expire_date" TYPE TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "invitations" ALTER COLUMN "answered_date" TYPE TIMESTAMP
        `);
  }
}
