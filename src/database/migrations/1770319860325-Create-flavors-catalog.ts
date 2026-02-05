import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFlavorsCatalog1770319860325 implements MigrationInterface {
    name = 'CreateFlavorsCatalog1770319860325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "flavors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_8297edd7c37e51ab4a4bd8bcbfe" UNIQUE ("name"), CONSTRAINT "PK_167d84f2986107e162f56a7ca79" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "flavors" ADD CONSTRAINT "FK_f77cb805483db47f6ba79e69ce6" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "flavors" ADD CONSTRAINT "FK_d2ce0739965391d92a235a017cd" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flavors" DROP CONSTRAINT "FK_d2ce0739965391d92a235a017cd"`);
        await queryRunner.query(`ALTER TABLE "flavors" DROP CONSTRAINT "FK_f77cb805483db47f6ba79e69ce6"`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`DROP TABLE "flavors"`);
    }

}
