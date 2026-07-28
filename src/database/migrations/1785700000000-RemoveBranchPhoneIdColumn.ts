import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveBranchPhoneIdColumn1785700000000
    implements MigrationInterface {
    name = 'RemoveBranchPhoneIdColumn1785700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "branches" DROP CONSTRAINT "FK_4fc2dfa7df2b760d9f452f8f9d6"`,
        );
        await queryRunner.query(
            `ALTER TABLE "branches" DROP CONSTRAINT "REL_4fc2dfa7df2b760d9f452f8f9d"`,
        );
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "phoneId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branches" ADD COLUMN "phoneId" uuid`);
        await queryRunner.query(`
      UPDATE "branches" b
      SET "phoneId" = p.id
      FROM "phones" p
      WHERE p."branchId" = b.id
    `);
        await queryRunner.query(
            `ALTER TABLE "branches" ADD CONSTRAINT "REL_4fc2dfa7df2b760d9f452f8f9d" UNIQUE ("phoneId")`,
        );
        await queryRunner.query(
            `ALTER TABLE "branches" ADD CONSTRAINT "FK_4fc2dfa7df2b760d9f452f8f9d6" FOREIGN KEY ("phoneId") REFERENCES "phones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }
}
