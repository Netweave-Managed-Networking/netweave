import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationsChangeName1778567667688
  implements MigrationInterface
{
  name = 'OrganizationsChangeName1778567667688';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "organizations"
                RENAME COLUMN "oname" TO "name"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "organizations"
                RENAME COLUMN "name" TO "oname"
        `);
  }
}
