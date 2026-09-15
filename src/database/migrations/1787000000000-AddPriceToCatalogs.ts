import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agrega `price` a los catálogos que extienden BaseCatalogEntity (bread_types,
 * fillings, frostings, styles, flowers). Permite mostrar/verificar el precio
 * de cada opción elegida durante la creación de un pedido (paso 4). No afecta
 * `colors`, que no extiende BaseCatalogEntity.
 */
export class AddPriceToCatalogs1787000000000 implements MigrationInterface {
    name = 'AddPriceToCatalogs1787000000000';

    private readonly tables = [
        'bread_types',
        'fillings',
        'frostings',
        'styles',
        'flowers',
    ];

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const table of this.tables) {
            await queryRunner.query(`
        ALTER TABLE "${table}" ADD "price" money NOT NULL DEFAULT 0
      `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        for (const table of this.tables) {
            await queryRunner.query(`
        ALTER TABLE "${table}" DROP COLUMN "price"
      `);
        }
    }
}
