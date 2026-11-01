import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cliente (reunión de capacitación 24 oct 2026): "Decoración con manga" pasa
 * a llamarse "Pompa" y se restringe a 4 opciones: Arriba, Abajo, Ambos,
 * Costado. Los pedidos de prueba existentes con un valor que ya no aplica
 * se dejan sin valor (el campo es opcional) en vez de mapearlos a una
 * opción nueva que el cliente no pidió.
 *
 * Se pasa la columna por "text" como paso intermedio: ni el enum viejo
 * tiene los valores nuevos ('TOP', 'BOTTOM', 'BOTH') ni el enum nuevo tiene
 * los viejos ('TOP_BORDER', etc.), así que no se puede reasignar valores
 * directamente de un enum a otro sin pasar por texto en medio.
 */
export class RestrictPipingLocationOptions1788100000000
    implements MigrationInterface {
    name = 'RestrictPipingLocationOptions1788100000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "order_details" ALTER COLUMN "pipingLocation" TYPE text USING "pipingLocation"::text`,
        );

        await queryRunner.query(
            `UPDATE "order_details" SET "pipingLocation" = 'TOP' WHERE "pipingLocation" = 'TOP_BORDER'`,
        );
        await queryRunner.query(
            `UPDATE "order_details" SET "pipingLocation" = 'BOTTOM' WHERE "pipingLocation" = 'BOTTOM_BORDER'`,
        );
        await queryRunner.query(
            `UPDATE "order_details" SET "pipingLocation" = 'BOTH' WHERE "pipingLocation" = 'FULL_BORDER'`,
        );
        await queryRunner.query(
            `UPDATE "order_details" SET "pipingLocation" = NULL WHERE "pipingLocation" IN ('CENTER', 'FULL_DESING', 'NONE')`,
        );

        await queryRunner.query(
            `DROP TYPE "public"."order_details_pipinglocation_enum"`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."order_details_pipinglocation_enum" AS ENUM('TOP', 'BOTTOM', 'BOTH', 'SIDE')`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_details" ALTER COLUMN "pipingLocation" TYPE "public"."order_details_pipinglocation_enum" USING "pipingLocation"::"public"."order_details_pipinglocation_enum"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No se puede restaurar qué pedidos tenían CENTER/FULL_DESING/NONE
        // originalmente (up() ya los dejó en NULL) ni a qué corresponde la
        // nueva opción SIDE (Costado), que no existía antes.
        await queryRunner.query(
            `ALTER TABLE "order_details" ALTER COLUMN "pipingLocation" TYPE text USING "pipingLocation"::text`,
        );

        await queryRunner.query(
            `UPDATE "order_details" SET "pipingLocation" = 'TOP_BORDER' WHERE "pipingLocation" = 'TOP'`,
        );
        await queryRunner.query(
            `UPDATE "order_details" SET "pipingLocation" = 'BOTTOM_BORDER' WHERE "pipingLocation" = 'BOTTOM'`,
        );
        await queryRunner.query(
            `UPDATE "order_details" SET "pipingLocation" = 'FULL_BORDER' WHERE "pipingLocation" = 'BOTH'`,
        );
        await queryRunner.query(
            `UPDATE "order_details" SET "pipingLocation" = NULL WHERE "pipingLocation" = 'SIDE'`,
        );

        await queryRunner.query(
            `DROP TYPE "public"."order_details_pipinglocation_enum"`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."order_details_pipinglocation_enum" AS ENUM('TOP_BORDER', 'BOTTOM_BORDER', 'FULL_BORDER', 'CENTER', 'FULL_DESING', 'NONE')`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_details" ALTER COLUMN "pipingLocation" TYPE "public"."order_details_pipinglocation_enum" USING "pipingLocation"::"public"."order_details_pipinglocation_enum"`,
        );
    }
}
