import { MigrationInterface, QueryRunner } from 'typeorm';

export class MailConfigCreate1790200000000 implements MigrationInterface {
  public name = 'MailConfigCreate1790200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "mail_config" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "host" character varying NOT NULL,
                "port" integer NOT NULL,
                "secure" boolean NOT NULL DEFAULT false,
                "auth_user" character varying,
                "auth_pass_encrypted" character varying,
                "from_name" character varying NOT NULL,
                "from_address" character varying NOT NULL,
                "updated_by_id" integer,
                CONSTRAINT "PK_mail_config_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "mail_config"
            ADD CONSTRAINT "FK_mail_config_updated_by_id" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "mail_config" DROP CONSTRAINT "FK_mail_config_updated_by_id"
        `);
    await queryRunner.query(`
            DROP TABLE "mail_config"
        `);
  }
}
