import { MigrationInterface, QueryRunner } from 'typeorm';

export class InvitationsCreate1790057195000 implements MigrationInterface {
  public name = 'InvitationsCreate1790057195000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "invitations" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "email" character varying NOT NULL,
                "expire_date" TIMESTAMP NOT NULL DEFAULT (now() + interval '3 months'),
                "answered_date" TIMESTAMP,
                "token" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'pending',
                "invited_by_id" integer NOT NULL,
                CONSTRAINT "UQ_invitations_token" UNIQUE ("token"),
                CONSTRAINT "PK_invitations_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "invitations"
            ADD CONSTRAINT "FK_invitations_invited_by_id" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "invitations" DROP CONSTRAINT "FK_invitations_invited_by_id"
        `);
    await queryRunner.query(`
            DROP TABLE "invitations"
        `);
  }
}
