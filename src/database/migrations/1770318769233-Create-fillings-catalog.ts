import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFillingsCatalog1770318769233 implements MigrationInterface {
    name = 'CreateFillingsCatalog1770318769233'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fillings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_0d9829c3c757676c1c71f7dd0f6" UNIQUE ("name"), CONSTRAINT "PK_4746af1800cd0c8885a08e7da94" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "fillings" ADD CONSTRAINT "FK_581b00ec8c633794af1881e0342" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fillings" ADD CONSTRAINT "FK_9798212dd68b845898f894726b1" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fillings" DROP CONSTRAINT "FK_9798212dd68b845898f894726b1"`);
        await queryRunner.query(`ALTER TABLE "fillings" DROP CONSTRAINT "FK_581b00ec8c633794af1881e0342"`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`DROP TABLE "fillings"`);
    }

}
