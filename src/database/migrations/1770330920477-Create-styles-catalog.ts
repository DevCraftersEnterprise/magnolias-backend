import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStylesCatalog1770330920477 implements MigrationInterface {
    name = 'CreateStylesCatalog1770330920477'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "styles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_ba0954270968477dcd9cd8cef9d" UNIQUE ("name"), CONSTRAINT "PK_1f22d2e5045f508c5fce0eb6e86" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "styles" ADD CONSTRAINT "FK_2fcb37957b286fc1b05e73215c9" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "styles" ADD CONSTRAINT "FK_7efd8889d85edc1966856e71d0a" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "styles" DROP CONSTRAINT "FK_7efd8889d85edc1966856e71d0a"`);
        await queryRunner.query(`ALTER TABLE "styles" DROP CONSTRAINT "FK_2fcb37957b286fc1b05e73215c9"`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`DROP TABLE "styles"`);
    }

}
