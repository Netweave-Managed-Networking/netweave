import { MigrationInterface, QueryRunner } from 'typeorm';

export class MembersAddViewOfNature1791800000000 implements MigrationInterface {
  public name = 'MembersAddViewOfNature1791800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "members"
            ADD COLUMN "view_of_nature" VARCHAR,
            ADD CONSTRAINT "CHK_members_view_of_nature" CHECK ("view_of_nature" IN ('robust', 'fragile', 'unpredictable', 'reasonably_robust'))
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "members"
            DROP CONSTRAINT "CHK_members_view_of_nature",
            DROP COLUMN "view_of_nature"
        `);
  }
}
