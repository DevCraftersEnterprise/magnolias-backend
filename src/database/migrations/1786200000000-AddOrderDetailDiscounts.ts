import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderDetailDiscounts1786200000000
    implements MigrationInterface {
    name = 'AddOrderDetailDiscounts1786200000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "order_details"
      ADD COLUMN "discountPercent" numeric(5,2) NOT NULL DEFAULT 0,
      ADD COLUMN "discountAuthorizedAt" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN "discountAuthorizedBy" uuid
    `);

        await queryRunner.query(`
      ALTER TABLE "order_details"
      ADD CONSTRAINT "FK_od_discountAuthorizedBy" FOREIGN KEY ("discountAuthorizedBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "order_details" DROP CONSTRAINT "FK_od_discountAuthorizedBy"`,
        );

        await queryRunner.query(`
      ALTER TABLE "order_details"
      DROP COLUMN "discountPercent",
      DROP COLUMN "discountAuthorizedAt",
      DROP COLUMN "discountAuthorizedBy"
    `);
    }
}
