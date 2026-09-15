import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cliente #3: agrega la ronda de entrega "RONDA_ESPECIAL" (fuera de los
 * horarios habituales), que tiene un costo adicional (`specialRoundCost`,
 * se suma a `totalAmount` igual que `setupServiceCost`).
 */
export class AddRondaEspecialToOrders1787300000000
    implements MigrationInterface {
    name = 'AddRondaEspecialToOrders1787300000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TYPE "public"."orders_deliveryround_enum" ADD VALUE 'RONDA_ESPECIAL'
    `);
        await queryRunner.query(`
      ALTER TABLE "orders" ADD "specialRoundCost" money NOT NULL DEFAULT 0
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "orders" DROP COLUMN "specialRoundCost"
    `);

        // Postgres no soporta quitar un valor de un enum directamente: hay que
        // recrear el tipo sin él (mismo mecanismo que RemoveAssistantRole).
        await queryRunner.query(`
      UPDATE "orders" SET "deliveryRound" = NULL WHERE "deliveryRound" = 'RONDA_ESPECIAL'
    `);
        await queryRunner.query(`
      ALTER TYPE "public"."orders_deliveryround_enum" RENAME TO "orders_deliveryround_enum_old"
    `);
        await queryRunner.query(`
      CREATE TYPE "public"."orders_deliveryround_enum" AS ENUM('ROUND_1', 'ROUND_2', 'ROUND_3')
    `);
        await queryRunner.query(`
      ALTER TABLE "orders" ALTER COLUMN "deliveryRound" TYPE "public"."orders_deliveryround_enum"
      USING "deliveryRound"::text::"public"."orders_deliveryround_enum"
    `);
        await queryRunner.query(
            `DROP TYPE "public"."orders_deliveryround_enum_old"`,
        );
    }
}
