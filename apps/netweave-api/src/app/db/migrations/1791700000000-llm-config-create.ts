import { MigrationInterface, QueryRunner } from 'typeorm';

export class LlmConfigCreate1791700000000 implements MigrationInterface {
  public name = 'LlmConfigCreate1791700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "llm_config" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "provider" character varying NOT NULL,
                "model" character varying NOT NULL,
                "base_url" character varying,
                "api_key_encrypted" character varying,
                "updated_by_id" integer,
                CONSTRAINT "PK_llm_config_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "llm_config"
            ADD CONSTRAINT "FK_llm_config_updated_by_id" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "llm_config" DROP CONSTRAINT "FK_llm_config_updated_by_id"
        `);
    await queryRunner.query(`
            DROP TABLE "llm_config"
        `);
  }
}
