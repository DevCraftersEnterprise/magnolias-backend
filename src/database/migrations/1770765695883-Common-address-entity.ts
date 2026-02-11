import { MigrationInterface, QueryRunner } from "typeorm";

export class CommonAddressEntity1770765695883 implements MigrationInterface {
    name = 'CommonAddressEntity1770765695883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "common_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "street" character varying(255) NOT NULL, "number" character varying(50) NOT NULL, "neighborhood" character varying(255) NOT NULL, "city" character varying(150), "postalCode" character varying(10), "interphoneCode" character varying(50), "beetweenStreets" character varying(255), "reference" text, "notes" text, "usageCount" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_a0d76cf5ae15b7354d323875612" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_dbcae3b4d31224c546e18295c9" ON "common_addresses" ("street", "number", "neighborhood") `);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "common_addresses" ADD CONSTRAINT "FK_5f2a6c188a4d215cb4386a3772e" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "common_addresses" ADD CONSTRAINT "FK_c9c543bec63eb2080be97f1f204" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "common_addresses" DROP CONSTRAINT "FK_c9c543bec63eb2080be97f1f204"`);
        await queryRunner.query(`ALTER TABLE "common_addresses" DROP CONSTRAINT "FK_5f2a6c188a4d215cb4386a3772e"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dbcae3b4d31224c546e18295c9"`);
        await queryRunner.query(`DROP TABLE "common_addresses"`);
    }

}
