import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnumnsModificationFormatsAndOrdersImprovement1770782878226 implements MigrationInterface {
  name = 'EnumnsModificationFormatsAndOrdersImprovement1770782878226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "productSize"`);
    await queryRunner.query(`DROP TYPE "public"."orders_productsize_enum"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customSize"`);
    await queryRunner.query(
      `CREATE TYPE "public"."order_details_productsize_enum" AS ENUM('10P', '15P', '20P', '25P', '30P', '40P', '50P', 'CUSTOM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD "productSize" "public"."order_details_productsize_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD "customSize" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."order_details_pipinglocation_enum" RENAME TO "order_details_pipinglocation_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_details_pipinglocation_enum" AS ENUM('TOP_BORDER', 'BOTTOM_BORDER', 'FULL_BORDER', 'CENTER', 'FULL_DESING', 'NONE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ALTER COLUMN "pipingLocation" TYPE "public"."order_details_pipinglocation_enum" USING UPPER("pipingLocation"::text)::"public"."order_details_pipinglocation_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."order_details_pipinglocation_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."orders_deliveryround_enum" RENAME TO "orders_deliveryround_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_deliveryround_enum" AS ENUM('ROUND_1', 'ROUND_2', 'ROUND_3')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "deliveryRound" TYPE "public"."orders_deliveryround_enum" USING UPPER("deliveryRound"::text)::"public"."orders_deliveryround_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."orders_deliveryround_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paidAmount" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "dessertsTotal" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "setupServiceCost" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "settlementTotal" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('CREATED', 'IN PROCESS', 'DONE', 'CANCELED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" USING UPPER("status"::text)::"public"."orders_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'CREATED'`,
    );
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER', 'ADMIN', 'EMPLOYEE', 'BAKER', 'ASSISTANT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING UPPER("role"::text)::"public"."users_role_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum_old" AS ENUM('super', 'admin', 'employee', 'baker', 'assistant')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING LOWER("role"::text)::"public"."users_role_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum_old" AS ENUM('created', 'in process', 'done', 'canceled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum_old" USING LOWER("status"::text)::"public"."orders_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'created'`,
    );
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."orders_status_enum_old" RENAME TO "orders_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "settlementTotal" SET DEFAULT '$0.00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "setupServiceCost" SET DEFAULT '$0.00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "dessertsTotal" SET DEFAULT '$0.00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paidAmount" SET DEFAULT '$0.00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '$0.00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '$0.00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '$0.00'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_deliveryround_enum_old" AS ENUM('round_1', 'round_2', 'round_3')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "deliveryRound" TYPE "public"."orders_deliveryround_enum_old" USING LOWER("deliveryRound"::text)::"public"."orders_deliveryround_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."orders_deliveryround_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."orders_deliveryround_enum_old" RENAME TO "orders_deliveryround_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_details_pipinglocation_enum_old" AS ENUM('top_border', 'bottom_border', 'full_border', 'center', 'full_desing', 'none')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ALTER COLUMN "pipingLocation" TYPE "public"."order_details_pipinglocation_enum_old" USING LOWER("pipingLocation"::text)::"public"."order_details_pipinglocation_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."order_details_pipinglocation_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."order_details_pipinglocation_enum_old" RENAME TO "order_details_pipinglocation_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP COLUMN "customSize"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP COLUMN "productSize"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."order_details_productsize_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "customSize" character varying(100)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_productsize_enum" AS ENUM('10P', '15P', '20P', '25P', '30P', '40P', '50P', 'CUSTOM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "productSize" "public"."orders_productsize_enum"`,
    );
  }
}
