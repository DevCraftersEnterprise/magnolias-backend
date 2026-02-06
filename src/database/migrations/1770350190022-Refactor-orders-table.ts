import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorOrdersTable1770350190022 implements MigrationInterface {
    name = 'RefactorOrdersTable1770350190022'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."orders_ordertype_enum" AS ENUM('H-ESP', 'DOMICILIO', 'TIENDA', 'FLOR')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "orderType" "public"."orders_ordertype_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "orderCode" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "UQ_a97c808a83af1497276bf85e5ba" UNIQUE ("orderCode")`);
        await queryRunner.query(`CREATE TYPE "public"."orders_deliveryround_enum" AS ENUM('round_1', 'round_2', 'round_3')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "deliveryRound" "public"."orders_deliveryround_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_productsize_enum" AS ENUM('10P', '15P', '20P', '25P', '30P', '40P', '50P', 'CUSTOM')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "productSize" "public"."orders_productsize_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "customSize" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "deliveryTime" TIME`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "pickupPersonName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "pickupPersonPhone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "deliveryAddress" text`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "deliveryNotes" text`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "totalAmount" money NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "advancePayment" money NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "remainingBalance" money NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "remainingBalance"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "advancePayment"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "totalAmount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deliveryNotes"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deliveryAddress"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "pickupPersonPhone"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "pickupPersonName"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deliveryTime"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customSize"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "productSize"`);
        await queryRunner.query(`DROP TYPE "public"."orders_productsize_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deliveryRound"`);
        await queryRunner.query(`DROP TYPE "public"."orders_deliveryround_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "UQ_a97c808a83af1497276bf85e5ba"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderCode"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderType"`);
        await queryRunner.query(`DROP TYPE "public"."orders_ordertype_enum"`);
    }

}
