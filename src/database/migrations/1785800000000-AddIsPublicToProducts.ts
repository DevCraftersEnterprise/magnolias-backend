import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsPublicToProducts1785800000000
    implements MigrationInterface {
    name = 'AddIsPublicToProducts1785800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "products" ADD "isPublic" boolean NOT NULL DEFAULT true`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "isPublic"`);
    }
}
