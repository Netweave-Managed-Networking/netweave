import { MigrationInterface, QueryRunner } from 'typeorm';

export class MembersAddInvitation1790300000000 implements MigrationInterface {
  public name = 'MembersAddInvitation1790300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "members"
            ADD "invitation_id" integer,
            ADD CONSTRAINT "UQ_members_invitation_id" UNIQUE ("invitation_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "members"
            ADD CONSTRAINT "FK_members_invitation_id" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "members" DROP CONSTRAINT "FK_members_invitation_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "members"
            DROP CONSTRAINT "UQ_members_invitation_id",
            DROP COLUMN "invitation_id"
        `);
  }
}
