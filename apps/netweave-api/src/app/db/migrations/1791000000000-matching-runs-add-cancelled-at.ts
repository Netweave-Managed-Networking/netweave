import { MigrationInterface, QueryRunner } from 'typeorm';

export class MatchingRunsAddCancelledAt1791000000000
  implements MigrationInterface
{
  public name = 'MatchingRunsAddCancelledAt1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "matching_runs"
            ADD COLUMN "cancelled_at" TIMESTAMPTZ
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "matching_runs" DROP COLUMN "cancelled_at"
        `);
  }
}
