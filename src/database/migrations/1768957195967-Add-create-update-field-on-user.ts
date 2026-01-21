import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreateUpdateFieldOnUser1768957195967 implements MigrationInterface {
    name = 'AddCreateUpdateFieldOnUser1768957195967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" date NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" date NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
    }

}
