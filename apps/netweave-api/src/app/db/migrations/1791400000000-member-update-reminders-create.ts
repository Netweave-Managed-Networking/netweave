import { MigrationInterface, QueryRunner } from 'typeorm';

export class MemberUpdateRemindersCreate1791400000000
  implements MigrationInterface
{
  public name = 'MemberUpdateRemindersCreate1791400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "member_update_reminders" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "member_id" integer NOT NULL,
                "email" character varying NOT NULL,
                CONSTRAINT "PK_member_update_reminders_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_member_update_reminders_member_id" ON "member_update_reminders" ("member_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "member_update_reminders"
            ADD CONSTRAINT "FK_member_update_reminders_member_id" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "member_update_reminders" DROP CONSTRAINT "FK_member_update_reminders_member_id"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_member_update_reminders_member_id"
        `);
    await queryRunner.query(`
            DROP TABLE "member_update_reminders"
        `);
  }
}
