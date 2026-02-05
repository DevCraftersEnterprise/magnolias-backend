import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomersTable1770310331141 implements MigrationInterface {
    name = 'CreateCustomersTable1770310331141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "alternativePhone" character varying(20), "email" character varying(255), "address" character varying(255), "alternativeAddress" character varying(255), "notes" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, "ordersId" uuid, CONSTRAINT "UQ_88acd889fbe17d0e16cc4bc9174" UNIQUE ("phone"), CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "clientName"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "clientPhone"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "customerId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('created', 'in process', 'done', 'canceled')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" USING "status"::"text"::"public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'created'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_b8c2a7a904f1f0e525a133e46ac" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_2ba4b3cf26d82265a4e271f10ba" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_6da780c1800bb5428ba9d59e9ed" FOREIGN KEY ("ordersId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_6da780c1800bb5428ba9d59e9ed"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_2ba4b3cf26d82265a4e271f10ba"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_b8c2a7a904f1f0e525a133e46ac"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum_old" AS ENUM('in process', 'done', 'canceled')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum_old" USING "status"::"text"::"public"."orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'in process'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum_old" RENAME TO "orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customerId"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "clientPhone" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "clientName" character varying(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE "customers"`);
    }

}
