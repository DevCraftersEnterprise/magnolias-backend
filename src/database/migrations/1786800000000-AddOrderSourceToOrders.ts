import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agrega `orderSource` a `orders`: el canal por el que se tomó el pedido
 * (WhatsApp, Instagram, Facebook, llamada telefónica o en persona). Sirve
 * como base para futuros reportes de ventas por canal.
 *
 * Nullable porque los pedidos ya existentes no tienen este dato (no hay
 * forma confiable de inferirlo retroactivamente) — queda como requerido
 * solo a nivel de DTO para pedidos nuevos, no a nivel de columna.
 */
export class AddOrderSourceToOrders1786800000000
    implements MigrationInterface {
    name = 'AddOrderSourceToOrders1786800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TYPE "public"."orders_ordersource_enum" AS ENUM('WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'PHONE_CALL', 'IN_PERSON')
    `);
        await queryRunner.query(`
      ALTER TABLE "orders" ADD "orderSource" "public"."orders_ordersource_enum"
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderSource"`);
        await queryRunner.query(`DROP TYPE "public"."orders_ordersource_enum"`);
    }
}
