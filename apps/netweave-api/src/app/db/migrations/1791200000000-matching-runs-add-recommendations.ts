import { MigrationInterface, QueryRunner } from 'typeorm';

export class MatchingRunsAddRecommendations1791200000000
  implements MigrationInterface
{
  public name = 'MatchingRunsAddRecommendations1791200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "matching_runs"
            ADD COLUMN "recommendations" jsonb
        `);
    await queryRunner.query(`
            ALTER TABLE "matching_runs"
            ADD COLUMN "ranking_strategy" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "matching_runs" DROP COLUMN "ranking_strategy"
        `);
    await queryRunner.query(`
            ALTER TABLE "matching_runs" DROP COLUMN "recommendations"
        `);
  }
}
