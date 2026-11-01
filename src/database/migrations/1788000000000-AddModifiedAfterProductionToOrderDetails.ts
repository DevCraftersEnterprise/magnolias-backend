import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cliente: ahora se puede editar un pedido mientras está Creado o En
 * proceso (antes solo Creado); si la edición toca una línea que ya había
 * arrancado producción, esa línea regresa a Pendiente y queda marcada para
 * que el tablero del pastelero le muestre "Modificado desde sucursal" hasta
 * que la retome (ver UpdateOrderUseCase / UpdateProductionStatusUseCase).
 */
export class AddModifiedAfterProductionToOrderDetails1788000000000
    implements MigrationInterface {
    name = 'AddModifiedAfterProductionToOrderDetails1788000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "order_details" ADD "modifiedAfterProduction" boolean NOT NULL DEFAULT false
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "order_details" DROP COLUMN "modifiedAfterProduction"
    `);
    }
}
