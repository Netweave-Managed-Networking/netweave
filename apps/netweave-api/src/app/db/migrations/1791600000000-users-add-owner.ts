import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * adds the owner flag: at most one owner (unique partial index), the owner is always an admin (check)
 * and cannot be deleted (triggers). Ownership stays transferable by unsetting `is_owner` of the
 * current owner and setting it on the new one within one transaction.
 */
export class UsersAddOwner1791600000000 implements MigrationInterface {
  public name = 'UsersAddOwner1791600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "is_owner" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_users_is_owner" ON "users" ("is_owner") WHERE "is_owner"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "CHK_users_owner_is_admin" CHECK (NOT "is_owner" OR "role" = 'admin')
        `);
    await queryRunner.query(`
            CREATE FUNCTION "users_prevent_owner_delete"() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
                IF OLD."is_owner" THEN
                    RAISE EXCEPTION 'The owner (user %) cannot be deleted, transfer the ownership first', OLD."id"
                        USING ERRCODE = 'restrict_violation';
                END IF;
                RETURN OLD;
            END
            $$
        `);
    await queryRunner.query(`
            CREATE TRIGGER "TRG_users_prevent_owner_delete"
            BEFORE DELETE ON "users"
            FOR EACH ROW EXECUTE FUNCTION "users_prevent_owner_delete"()
        `);
    // TRUNCATE skips row level triggers, so it is guarded separately
    await queryRunner.query(`
            CREATE FUNCTION "users_prevent_owner_truncate"() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
                IF EXISTS (SELECT 1 FROM "users" WHERE "is_owner") THEN
                    RAISE EXCEPTION 'The owner cannot be deleted, transfer the ownership first'
                        USING ERRCODE = 'restrict_violation';
                END IF;
                RETURN NULL;
            END
            $$
        `);
    await queryRunner.query(`
            CREATE TRIGGER "TRG_users_prevent_owner_truncate"
            BEFORE TRUNCATE ON "users"
            FOR EACH STATEMENT EXECUTE FUNCTION "users_prevent_owner_truncate"()
        `);
    // existing instances: the oldest verified admin becomes the owner
    await queryRunner.query(`
            UPDATE "users" SET "is_owner" = true
            WHERE "id" = (
                SELECT "id" FROM "users"
                WHERE "role" = 'admin' AND "email_verified_at" IS NOT NULL
                ORDER BY "created_at" ASC, "id" ASC
                LIMIT 1
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TRIGGER "TRG_users_prevent_owner_truncate" ON "users"
        `);
    await queryRunner.query(`
            DROP FUNCTION "users_prevent_owner_truncate"()
        `);
    await queryRunner.query(`
            DROP TRIGGER "TRG_users_prevent_owner_delete" ON "users"
        `);
    await queryRunner.query(`
            DROP FUNCTION "users_prevent_owner_delete"()
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "CHK_users_owner_is_admin"
        `);
    await queryRunner.query(`
            DROP INDEX "UQ_users_is_owner"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "is_owner"
        `);
  }
}
