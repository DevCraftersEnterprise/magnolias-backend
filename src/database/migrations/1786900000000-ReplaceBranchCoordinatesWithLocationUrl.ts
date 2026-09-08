import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Reemplaza latitude/longitude (geocodificadas automáticamente a partir de
 * la dirección) por locationUrl: un enlace de Google Maps que el
 * administrador pega a mano y que el frontend embebe en un iframe. Se quita
 * la dependencia de geocodificación automática por completo.
 */
export class ReplaceBranchCoordinatesWithLocationUrl1786900000000
    implements MigrationInterface {
    name = 'ReplaceBranchCoordinatesWithLocationUrl1786900000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "branches" ADD "locationUrl" text`,
        );
        await queryRunner.query(
            `ALTER TABLE "branches" DROP COLUMN "latitude"`,
        );
        await queryRunner.query(
            `ALTER TABLE "branches" DROP COLUMN "longitude"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "branches" ADD "latitude" numeric(10,7)`,
        );
        await queryRunner.query(
            `ALTER TABLE "branches" ADD "longitude" numeric(10,7)`,
        );
        await queryRunner.query(
            `ALTER TABLE "branches" DROP COLUMN "locationUrl"`,
        );
    }
}
