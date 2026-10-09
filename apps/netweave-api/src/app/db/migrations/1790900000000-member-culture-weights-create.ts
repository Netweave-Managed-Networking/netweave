import { MigrationInterface, QueryRunner } from 'typeorm';

export class MemberCultureWeightsCreate1790900000000
  implements MigrationInterface
{
  public name = 'MemberCultureWeightsCreate1790900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "member_culture_weights" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "member_id" integer NOT NULL,
                "item_id" character varying NOT NULL,
                "weight" integer NOT NULL,
                "topic_total" integer NOT NULL,
                CONSTRAINT "UQ_member_culture_weights_member_id_item_id" UNIQUE ("member_id", "item_id"),
                CONSTRAINT "CHK_member_culture_weights_weight" CHECK ("weight" >= 0),
                CONSTRAINT "CHK_member_culture_weights_topic_total" CHECK ("topic_total" > 0),
                CONSTRAINT "PK_member_culture_weights_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "member_culture_weights"
            ADD CONSTRAINT "FK_member_culture_weights_member_id" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "member_culture_weights" DROP CONSTRAINT "FK_member_culture_weights_member_id"
        `);
    await queryRunner.query(`
            DROP TABLE "member_culture_weights"
        `);
  }
}
