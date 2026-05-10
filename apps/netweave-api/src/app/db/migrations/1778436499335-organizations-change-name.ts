import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationsChangeName1778436499335
  implements MigrationInterface
{
  name = 'OrganizationsChangeNamee1778436499335';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "organizations"
                RENAME COLUMN "name" TO "oname"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "organizations"
                RENAME COLUMN "oname" TO "name"
        `);
  }
}
