import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActivFieldToColors1771360416903 implements MigrationInterface {
    name = 'AddIsActivFieldToColors1771360416903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "colors" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paidAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "dessertsTotal" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "setupServiceCost" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "settlementTotal" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "settlementTotal" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "setupServiceCost" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "dessertsTotal" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paidAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "colors" DROP COLUMN "isActive"`);
    }

}
