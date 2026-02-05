import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBreadTypesCatalog1770317856263 implements MigrationInterface {
    name = 'CreateBreadTypesCatalog1770317856263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bread_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_484edd556789ac7397c7e719e88" UNIQUE ("name"), CONSTRAINT "PK_30aaef910a4967171729671b198" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "bread_types" ADD CONSTRAINT "FK_f483cc6f2781f6f15e6189c15ca" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bread_types" ADD CONSTRAINT "FK_6459990afbea4c739c916696fd4" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bread_types" DROP CONSTRAINT "FK_6459990afbea4c739c916696fd4"`);
        await queryRunner.query(`ALTER TABLE "bread_types" DROP CONSTRAINT "FK_f483cc6f2781f6f15e6189c15ca"`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`DROP TABLE "bread_types"`);
    }

}
