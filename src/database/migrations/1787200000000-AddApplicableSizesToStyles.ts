import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cliente #5: "forma y tamaño deben ir juntos". Agrega `applicableSizes` a
 * `styles` (simple-array de ProductSize, nullable) — una forma sin valor
 * aplica para cualquier tamaño; el filtrado por tamaño elegido se hace en
 * el frontend, el backend no valida la combinación (ver plan de este item).
 */
export class AddApplicableSizesToStyles1787200000000
    implements MigrationInterface {
    name = 'AddApplicableSizesToStyles1787200000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "styles" ADD "applicableSizes" text
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "styles" DROP COLUMN "applicableSizes"
    `);
    }
}
