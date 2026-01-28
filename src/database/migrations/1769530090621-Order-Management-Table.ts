import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderManagementTable1769530090621 implements MigrationInterface {
    name = 'OrderManagementTable1769530090621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('in process', 'done', 'canceled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clientName" character varying(255) NOT NULL, "clientPhone" character varying(255) NOT NULL, "deliveryDate" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'in process', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "branchId" uuid NOT NULL, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_873d9661d948ee484150cf4c73d" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_8d17fd47a7bbf512e58209fbb38" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_6b1a67abb0da83b51c7a2fbac40" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_6b1a67abb0da83b51c7a2fbac40"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_8d17fd47a7bbf512e58209fbb38"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_873d9661d948ee484150cf4c73d"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    }

}
