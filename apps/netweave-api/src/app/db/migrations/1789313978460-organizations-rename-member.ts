import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationsRenameMember1789313978460
  implements MigrationInterface
{
  public name = 'OrganizationsRenameMember1789313978460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE organizations RENAME TO members`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE members RENAME TO organizations`);
  }
}
