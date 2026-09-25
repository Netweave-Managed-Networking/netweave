import { MigrationInterface, QueryRunner } from 'typeorm';

export class MatchingRunsAddInputHash1790700000000
  implements MigrationInterface
{
  public name = 'MatchingRunsAddInputHash1790700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "matching_runs"
            ADD "input_hash" character varying(64)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "matching_runs" DROP COLUMN "input_hash"
        `);
  }
}
