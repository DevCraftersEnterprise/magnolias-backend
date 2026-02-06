import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBakersTable1770404501060 implements MigrationInterface {
    name = 'CreateBakersTable1770404501060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."bakers_area_enum" AS ENUM('BO', 'PA', 'PE', 'CK', '3L')`);
        await queryRunner.query(`CREATE TABLE "bakers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "area" "public"."bakers_area_enum" NOT NULL, "specialty" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_94afe7513fb7c961f11f15a1a7a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "assignedDate" TIMESTAMP WITH TIME ZONE NOT NULL, "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "bakerId" uuid NOT NULL, "orderId" uuid NOT NULL, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_519d4a549818b74ed40f72dd893" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "bakers" ADD CONSTRAINT "FK_b0d2a997f232edc840e481e84cf" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bakers" ADD CONSTRAINT "FK_99473702e5db2ebeb3c6f1bd21a" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_assignments" ADD CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92" FOREIGN KEY ("bakerId") REFERENCES "bakers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_assignments" ADD CONSTRAINT "FK_be2c5ad5e40bd737781a9b6c2c4" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_assignments" ADD CONSTRAINT "FK_fcbc95aa105f695d11a143091fd" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_assignments" ADD CONSTRAINT "FK_7a7079958276fc52cb914435860" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_assignments" DROP CONSTRAINT "FK_7a7079958276fc52cb914435860"`);
        await queryRunner.query(`ALTER TABLE "order_assignments" DROP CONSTRAINT "FK_fcbc95aa105f695d11a143091fd"`);
        await queryRunner.query(`ALTER TABLE "order_assignments" DROP CONSTRAINT "FK_be2c5ad5e40bd737781a9b6c2c4"`);
        await queryRunner.query(`ALTER TABLE "order_assignments" DROP CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92"`);
        await queryRunner.query(`ALTER TABLE "bakers" DROP CONSTRAINT "FK_99473702e5db2ebeb3c6f1bd21a"`);
        await queryRunner.query(`ALTER TABLE "bakers" DROP CONSTRAINT "FK_b0d2a997f232edc840e481e84cf"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`DROP TABLE "order_assignments"`);
        await queryRunner.query(`DROP TABLE "bakers"`);
        await queryRunner.query(`DROP TYPE "public"."bakers_area_enum"`);
    }

}
