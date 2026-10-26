import { MigrationInterface, QueryRunner } from 'typeorm';

export class MemberViewOfEnvironmentAnswersCreate1791500000000
  implements MigrationInterface
{
  public name = 'MemberViewOfEnvironmentAnswersCreate1791500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "member_view_of_environment_answers" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "member_id" integer NOT NULL,
                "item_id" character varying NOT NULL,
                "answer" smallint NOT NULL,
                CONSTRAINT "UQ_member_view_of_environment_answers_member_id_item_id" UNIQUE ("member_id", "item_id"),
                CONSTRAINT "CHK_member_view_of_environment_answers_answer" CHECK ("answer" BETWEEN 0 AND 4),
                CONSTRAINT "PK_member_view_of_environment_answers_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "member_view_of_environment_answers"
            ADD CONSTRAINT "FK_member_view_of_environment_answers_member_id" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "member_view_of_environment_answers" DROP CONSTRAINT "FK_member_view_of_environment_answers_member_id"
        `);
    await queryRunner.query(`
            DROP TABLE "member_view_of_environment_answers"
        `);
  }
}
