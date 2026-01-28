import { MigrationInterface, QueryRunner } from "typeorm";

export class ColorIdChanged1769630878529 implements MigrationInterface {
    name = 'ColorIdChanged1769630878529'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_c814ee0b6fbf0576539c9236d8f"`);
        await queryRunner.query(`ALTER TABLE "colors" DROP CONSTRAINT "PK_3a62edc12d29307872ab1777ced"`);
        await queryRunner.query(`ALTER TABLE "colors" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "colors" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "colors" ADD CONSTRAINT "PK_3a62edc12d29307872ab1777ced" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "colorId"`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "colorId" uuid`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_c814ee0b6fbf0576539c9236d8f" FOREIGN KEY ("colorId") REFERENCES "colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_c814ee0b6fbf0576539c9236d8f"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "colorId"`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "colorId" integer`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "colors" DROP CONSTRAINT "PK_3a62edc12d29307872ab1777ced"`);
        await queryRunner.query(`ALTER TABLE "colors" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "colors" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "colors" ADD CONSTRAINT "PK_3a62edc12d29307872ab1777ced" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_c814ee0b6fbf0576539c9236d8f" FOREIGN KEY ("colorId") REFERENCES "colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
