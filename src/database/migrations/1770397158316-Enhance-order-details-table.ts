import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceOrderDetailsTable1770397158316 implements MigrationInterface {
    name = 'EnhanceOrderDetailsTable1770397158316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_details" ADD "hasWriting" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "writingText" character varying(255)`);
        await queryRunner.query(`CREATE TYPE "public"."order_details_writinglocation_enum" AS ENUM('TOP', 'CENTER', 'BOTTOM', 'SIDE', 'PLAQUE')`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "writingLocation" "public"."order_details_writinglocation_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."order_details_pipinglocation_enum" AS ENUM('top_border', 'bottom_border', 'full_border', 'center', 'full_desing', 'none')`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "pipingLocation" "public"."order_details_pipinglocation_enum"`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "breadTypeId" uuid`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "fillingId" uuid`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "flavorId" uuid`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "frostingId" uuid`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "styleId" uuid`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_e847a32f74c072d4d610cb63256" FOREIGN KEY ("breadTypeId") REFERENCES "bread_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_bb1e0884cd08e1509be3a2d467a" FOREIGN KEY ("fillingId") REFERENCES "fillings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_dd5d8772d23de187f3086e74c70" FOREIGN KEY ("flavorId") REFERENCES "flavors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_900b7f1d7294eddeb1c99531308" FOREIGN KEY ("frostingId") REFERENCES "frostings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_a5776525112fd5625dddbdf92e3" FOREIGN KEY ("styleId") REFERENCES "styles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_a5776525112fd5625dddbdf92e3"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_900b7f1d7294eddeb1c99531308"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_dd5d8772d23de187f3086e74c70"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_bb1e0884cd08e1509be3a2d467a"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_e847a32f74c072d4d610cb63256"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "styleId"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "frostingId"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "flavorId"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "fillingId"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "breadTypeId"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "pipingLocation"`);
        await queryRunner.query(`DROP TYPE "public"."order_details_pipinglocation_enum"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "writingLocation"`);
        await queryRunner.query(`DROP TYPE "public"."order_details_writinglocation_enum"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "writingText"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "hasWriting"`);
    }

}
