import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductsTable1769390851018 implements MigrationInterface {
    name = 'ProductsTable1769390851018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_f74bae41998e06cc579f081ea78" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_2e0b16181fa66c6e36cba5c89af" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_2e0b16181fa66c6e36cba5c89af"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_f74bae41998e06cc579f081ea78"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
