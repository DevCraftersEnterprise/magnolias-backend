import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cliente: "fecha de evento" y "fecha de montaje" se trataban como si
 * fueran la misma, porque el pedido solo tenía una fecha (deliveryDate)
 * para todo el pedido y ninguna columna propia para el día de montaje.
 * Se agrega `setupDate` (opcional) para representar un día distinto al
 * del evento/entrega cuando aplique.
 */
export class AddSetupDateToOrders1787700000000
    implements MigrationInterface {
    name = 'AddSetupDateToOrders1787700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "orders" ADD "setupDate" TIMESTAMP WITH TIME ZONE NULL
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "orders" DROP COLUMN "setupDate"
    `);
    }
}
