import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceOrderTypeWithFlags1786400000000
    implements MigrationInterface {
    name = 'ReplaceOrderTypeWithFlags1786400000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN "isEvento" boolean NOT NULL DEFAULT false,
      ADD COLUMN "isEnTienda" boolean NOT NULL DEFAULT false,
      ADD COLUMN "includesFlowers" boolean NOT NULL DEFAULT false
    `);

        await queryRunner.query(`
      UPDATE "orders" SET "isEnTienda" = true WHERE "orderType" = 'VITRINA'
    `);

        await queryRunner.query(`
      UPDATE "orders" SET "isEvento" = true WHERE "orderType" = 'EVENTO'
    `);

        await queryRunner.query(`
      UPDATE "orders" SET "includesFlowers" = true
      WHERE "id" IN (SELECT DISTINCT "orderId" FROM "order_flowers")
    `);

        await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "CHK_orders_evento_tienda_exclusive"
      CHECK (NOT ("isEvento" AND "isEnTienda"))
    `);

        await queryRunner.query(`
      ALTER TABLE "orders" DROP COLUMN "orderType"
    `);

        await queryRunner.query(`
      DROP TYPE "public"."orders_ordertype_enum"
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TYPE "public"."orders_ordertype_enum" AS ENUM('H-ESP', 'DOMICILIO', 'TIENDA', 'FLOR', 'VITRINA', 'EVENTO', 'PERSONALIZADO')
    `);

        await queryRunner.query(`
      ALTER TABLE "orders" ADD COLUMN "orderType" "public"."orders_ordertype_enum"
    `);

        await queryRunner.query(`
      UPDATE "orders" SET "orderType" = 'VITRINA' WHERE "isEnTienda" = true
    `);

        await queryRunner.query(`
      UPDATE "orders" SET "orderType" = 'EVENTO' WHERE "isEvento" = true
    `);

        await queryRunner.query(`
      UPDATE "orders" SET "orderType" = 'FLOR'
      WHERE "orderType" IS NULL AND "includesFlowers" = true
    `);

        await queryRunner.query(`
      UPDATE "orders" SET "orderType" = 'DOMICILIO' WHERE "orderType" IS NULL
    `);

        await queryRunner.query(`
      ALTER TABLE "orders" ALTER COLUMN "orderType" SET NOT NULL
    `);

        await queryRunner.query(`
      ALTER TABLE "orders" DROP CONSTRAINT "CHK_orders_evento_tienda_exclusive"
    `);

        await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN "isEvento",
      DROP COLUMN "isEnTienda",
      DROP COLUMN "includesFlowers"
    `);
    }
}
