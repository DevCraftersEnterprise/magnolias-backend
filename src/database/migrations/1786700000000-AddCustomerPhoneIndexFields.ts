import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `phoneHash` (deterministic HMAC-SHA256 blind index) and `phoneLast4`
 * (plaintext last 4 digits) to `customers`, to fix exact-match lookup and
 * uniqueness on `phone` (broken today because `phone` is encrypted with a
 * random IV per save, so no ciphertext-vs-ciphertext SQL comparison ever
 * matches) and to support an additional last-4-digit search.
 *
 * Both columns start nullable: existing rows only have the old encrypted
 * `phone` and need a separate backfill script (`src/scripts/backfill-
 * customer-phone-index.ts`) to populate them, since that requires
 * decrypting with ENCRYPTION_KEY at runtime, not something a pure-SQL
 * migration can do. Postgres allows multiple NULLs in a UNIQUE index, so
 * the unique index on `phoneHash` is safe to create immediately.
 */
export class AddCustomerPhoneIndexFields1786700000000
    implements MigrationInterface {
    name = 'AddCustomerPhoneIndexFields1786700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "customers" ADD "phoneHash" character varying(64)`,
        );
        await queryRunner.query(
            `ALTER TABLE "customers" ADD "phoneLast4" character varying(4)`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "UQ_customers_phoneHash" ON "customers" ("phoneHash")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_customers_phoneLast4" ON "customers" ("phoneLast4")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "public"."IDX_customers_phoneLast4"`,
        );
        await queryRunner.query(`DROP INDEX "public"."UQ_customers_phoneHash"`);
        await queryRunner.query(
            `ALTER TABLE "customers" DROP COLUMN "phoneLast4"`,
        );
        await queryRunner.query(
            `ALTER TABLE "customers" DROP COLUMN "phoneHash"`,
        );
    }
}
