import { MigrationInterface, QueryRunner } from "typeorm";

export class EncryptTransferAccountFieldUpdate1770824694227 implements MigrationInterface {
    name = 'EncryptTransferAccountFieldUpdate1770824694227'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paidAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "dessertsTotal" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "setupServiceCost" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "transferAccount"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "transferAccount" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "settlementTotal" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "settlementTotal" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "transferAccount"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "transferAccount" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "setupServiceCost" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "dessertsTotal" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paidAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
    }

}
