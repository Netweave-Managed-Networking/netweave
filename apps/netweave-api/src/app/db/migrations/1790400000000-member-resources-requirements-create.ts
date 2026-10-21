import { MigrationInterface, QueryRunner } from 'typeorm';

export class MemberResourcesRequirementsCreate1790400000000
  implements MigrationInterface
{
  public name = 'MemberResourcesRequirementsCreate1790400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "member_resources_requirements" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "member_id" integer NOT NULL,
                "category" character varying NOT NULL,
                "resources" text,
                "requirements" text,
                CONSTRAINT "UQ_member_resources_requirements_member_id_category" UNIQUE ("member_id", "category"),
                CONSTRAINT "PK_member_resources_requirements_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "member_resources_requirements"
            ADD CONSTRAINT "FK_member_resources_requirements_member_id" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "member_resources_requirements" DROP CONSTRAINT "FK_member_resources_requirements_member_id"
        `);
    await queryRunner.query(`
            DROP TABLE "member_resources_requirements"
        `);
  }
}
