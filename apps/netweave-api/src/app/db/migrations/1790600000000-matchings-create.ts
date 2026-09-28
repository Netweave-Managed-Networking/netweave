import { MigrationInterface, QueryRunner } from 'typeorm';

export class MatchingsCreate1790600000000 implements MigrationInterface {
  public name = 'MatchingsCreate1790600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "matching_runs" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "finished_at" TIMESTAMP,
                CONSTRAINT "PK_matching_runs_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "matchings" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "matching_run_id" integer NOT NULL,
                "member_seeker_id" integer NOT NULL,
                "member_potential_match_id" integer NOT NULL,
                "score" smallint NOT NULL,
                "details" jsonb,
                CONSTRAINT "UQ_matchings_run_seeker_potential_match" UNIQUE ("matching_run_id", "member_seeker_id", "member_potential_match_id"),
                CONSTRAINT "CHK_matchings_score" CHECK ("score" BETWEEN 0 AND 100),
                CONSTRAINT "PK_matchings_id" PRIMARY KEY ("id")
            )
        `);
    // the unique constraint only covers lookups by run, these keep member lookups and cascading deletes fast
    await queryRunner.query(`
            CREATE INDEX "IDX_matchings_member_seeker_id" ON "matchings" ("member_seeker_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_matchings_member_potential_match_id" ON "matchings" ("member_potential_match_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "matchings"
            ADD CONSTRAINT "FK_matchings_matching_run_id" FOREIGN KEY ("matching_run_id") REFERENCES "matching_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "matchings"
            ADD CONSTRAINT "FK_matchings_member_seeker_id" FOREIGN KEY ("member_seeker_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "matchings"
            ADD CONSTRAINT "FK_matchings_member_potential_match_id" FOREIGN KEY ("member_potential_match_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "matchings" DROP CONSTRAINT "FK_matchings_member_potential_match_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "matchings" DROP CONSTRAINT "FK_matchings_member_seeker_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "matchings" DROP CONSTRAINT "FK_matchings_matching_run_id"
        `);
    await queryRunner.query(`
            DROP TABLE "matchings"
        `);
    await queryRunner.query(`
            DROP TABLE "matching_runs"
        `);
  }
}
