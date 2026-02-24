import { MigrationInterface, QueryRunner } from "typeorm";

export class NewOrderStatus1771360939583 implements MigrationInterface {
    name = 'NewOrderStatus1771360939583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paidAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "dessertsTotal" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "setupServiceCost" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "settlementTotal" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('CREATED', 'IN PROCESS', 'DONE', 'DELIVERED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" USING "status"::"text"::"public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'CREATED'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum_old" AS ENUM('CREATED', 'IN PROCESS', 'DONE', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum_old" USING "status"::"text"::"public"."orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'CREATED'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum_old" RENAME TO "orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "settlementTotal" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "setupServiceCost" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "dessertsTotal" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paidAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
    }

}
