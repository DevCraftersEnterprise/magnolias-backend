import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cliente: el repartidor debe poder "tomar" un pedido disponible en vez de
 * que el admin se lo asigne, y dos repartidores no deben poder quedarse con
 * el mismo pedido si lo toman casi al mismo tiempo. La app ya evita crear
 * una segunda asignación con un find-or-create, pero no había ninguna
 * restricción a nivel de base de datos - se agrega como última red de
 * seguridad además del lock a nivel de aplicación (ClaimOrderDeliveryUseCase).
 */
export class AddUniqueOrderIdToDeliveryAssignments1787900000000
    implements MigrationInterface {
    name = 'AddUniqueOrderIdToDeliveryAssignments1787900000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "order_delivery_assignments" ADD CONSTRAINT "UQ_odla_orderId" UNIQUE ("orderId")
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "order_delivery_assignments" DROP CONSTRAINT "UQ_odla_orderId"
    `);
    }
}
