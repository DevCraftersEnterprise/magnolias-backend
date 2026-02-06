import { MigrationInterface, QueryRunner } from "typeorm";

export class IncreasePhoneColumnsLength1770407657649 implements MigrationInterface {
    name = 'IncreasePhoneColumnsLength1770407657649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "UQ_88acd889fbe17d0e16cc4bc9174"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "phone" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "UQ_88acd889fbe17d0e16cc4bc9174" UNIQUE ("phone")`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "alternativePhone"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "alternativePhone" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "pickupPersonPhone"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "pickupPersonPhone" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "pickupPersonPhone"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "pickupPersonPhone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "alternativePhone"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "alternativePhone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "UQ_88acd889fbe17d0e16cc4bc9174"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "phone" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "UQ_88acd889fbe17d0e16cc4bc9174" UNIQUE ("phone")`);
    }

}
