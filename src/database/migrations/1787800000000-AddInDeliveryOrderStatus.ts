import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cliente: se necesita un estado intermedio entre "Listo" (DONE) y
 * "Entregado" (DELIVERED) para reflejar que un repartidor ya tomó el
 * pedido y lo lleva en camino. Solo agrega el valor del enum - no hace
 * ningún backfill de datos en esta misma migración porque Postgres no
 * permite usar un valor de enum recién agregado dentro de la misma
 * transacción que lo crea, y TypeORM 0.3 corre todas las migraciones
 * pendientes de una corrida en una sola transacción por defecto.
 */
export class AddInDeliveryOrderStatus1787800000000
    implements MigrationInterface {
    name = 'AddInDeliveryOrderStatus1787800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TYPE "public"."orders_status_enum" ADD VALUE 'IN DELIVERY'
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE "orders" SET "status" = 'DONE' WHERE "status" = 'IN DELIVERY'`,
        );
        // A diferencia de "users"."role" (sin DEFAULT), "orders"."status" sí
        // tiene DEFAULT 'CREATED' - hay que quitarlo antes de cambiar el tipo
        // de la columna (Postgres no puede castear automáticamente el
        // default de un enum a otro) y volver a ponerlo después.
        await queryRunner.query(
            `ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`,
        );
        await queryRunner.query(
            `ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."orders_status_enum" AS ENUM('CREATED', 'IN PROCESS', 'DONE', 'DELIVERED', 'CANCELED')`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" USING "status"::text::"public"."orders_status_enum"`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'CREATED'`,
        );
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum_old"`);
    }
}
