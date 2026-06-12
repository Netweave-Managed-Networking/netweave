import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersFixesRoleNoDefaultSequenceRename1781288095192
  implements MigrationInterface
{
  public name = 'UsersFixesRoleNoDefaultSequenceRename1781288095192';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE SEQUENCE IF NOT EXISTS "users_id_seq" OWNED BY "users"."id"
    `);
    await queryRunner.query(`
        ALTER TABLE "users"
        ALTER COLUMN "id"
        SET DEFAULT nextval('"users_id_seq"')
    `);
    await queryRunner.query(`
        ALTER TABLE "users"
        ALTER COLUMN "id" DROP DEFAULT
    `);
    await queryRunner.query(`
        ALTER TABLE "users"
        ALTER COLUMN "role" DROP DEFAULT
    `);
    await queryRunner.query(`
        DROP SEQUENCE "user_id_seq"
    `);
    await queryRunner.query(`
        ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT nextval('"users_id_seq"')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "user_id_seq" OWNED BY "users"."id"`,
    );
    await queryRunner.query(`
        ALTER TABLE "users"
        ALTER COLUMN "role"
        SET DEFAULT 'editor'
    `);
    await queryRunner.query(`
        ALTER TABLE "users"
        ALTER COLUMN "id"
        SET DEFAULT nextval('user_id_seq')
    `);
    await queryRunner.query(`
        ALTER TABLE "users"
        ALTER COLUMN "id" DROP DEFAULT
    `);
    await queryRunner.query(`
        DROP SEQUENCE "users_id_seq"
    `);
    await queryRunner.query(`
        ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT nextval('"user_id_seq"')
    `);
  }
}
