import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * El editor de pisos (order_detail_tiers) nunca tuvo Forma (style), solo
 * Tamaño — quedó desincronizado cuando el cliente #5 combinó Forma+Tamaño
 * en la línea principal del producto. Se agrega la misma relación opcional
 * que ya tienen breadType/filling/frosting/color por piso.
 */
export class AddStyleToOrderDetailTiers1787600000000
    implements MigrationInterface {
    name = 'AddStyleToOrderDetailTiers1787600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "order_detail_tiers" ADD "styleId" uuid NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_tiers"
      ADD CONSTRAINT "FK_order_detail_tiers_style" FOREIGN KEY ("styleId")
      REFERENCES "styles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "order_detail_tiers" DROP CONSTRAINT "FK_order_detail_tiers_style"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_detail_tiers" DROP COLUMN "styleId"`,
        );
    }
}
