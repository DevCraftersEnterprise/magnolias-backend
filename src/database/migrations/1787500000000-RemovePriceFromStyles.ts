import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cliente: forma y tamaño no deben manejar precio. Style (Forma) había
 * quedado incluido por error entre los catálogos con precio del cliente #1
 * (junto a BreadType/Filling/Frosting/Flower/Decoration/Fruit).
 */
export class RemovePriceFromStyles1787500000000
    implements MigrationInterface {
    name = 'RemovePriceFromStyles1787500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "styles" DROP COLUMN "price"
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "styles" ADD "price" money NOT NULL DEFAULT 0
    `);
    }
}
