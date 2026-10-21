import { MigrationInterface, QueryRunner } from 'typeorm';

export class MatchingRunsAddFailedAt1790700000000
  implements MigrationInterface
{
  public name = 'MatchingRunsAddFailedAt1790700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "matching_runs"
            ADD COLUMN "failed_at" TIMESTAMP
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "matching_runs" DROP COLUMN "failed_at"
        `);
  }
}
