import { MigrationInterface, QueryRunner } from 'typeorm';

const TABLES = [
  'user-email-whitelists',
  'mail_config',
  'matching_runs',
  'matchings',
  'users',
  'member_resources_requirements',
  'invitations',
  'members',
];

/** a timestamp (no time zone) column is ambiguous: postgres silently discards any offset on write, and drivers
 * read it back using their own local timezone instead of UTC; timestamptz avoids both */
export class TimestampColumnsUseTimezone1790800000000
  implements MigrationInterface
{
  public name = 'TimestampColumnsUseTimezone1790800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "created_at" TYPE TIMESTAMPTZ`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "matching_runs" ALTER COLUMN "finished_at" TYPE TIMESTAMPTZ`,
    );
    await queryRunner.query(
      `ALTER TABLE "matching_runs" ALTER COLUMN "failed_at" TYPE TIMESTAMPTZ`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ALTER COLUMN "expire_date" TYPE TIMESTAMPTZ`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ALTER COLUMN "answered_date" TYPE TIMESTAMPTZ`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "created_at" TYPE TIMESTAMP`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "updated_at" TYPE TIMESTAMP`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "matching_runs" ALTER COLUMN "finished_at" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "matching_runs" ALTER COLUMN "failed_at" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ALTER COLUMN "expire_date" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ALTER COLUMN "answered_date" TYPE TIMESTAMP`,
    );
  }
}
