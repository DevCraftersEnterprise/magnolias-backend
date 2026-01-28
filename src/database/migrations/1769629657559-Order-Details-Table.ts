import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderDetailsTable1769629657559 implements MigrationInterface {
    name = 'OrderDetailsTable1769629657559'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "order_details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "price" money NOT NULL DEFAULT '0', "quantity" integer NOT NULL DEFAULT '1', "notes" text, "referenceImageUrl" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productId" uuid NOT NULL, "orderId" uuid NOT NULL, "colorId" integer, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_278a6e0f21c9db1653e6f406801" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_c67ebaba3e5085b6401911acc70" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_147bc15de4304f89a93c7eee969" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_c814ee0b6fbf0576539c9236d8f" FOREIGN KEY ("colorId") REFERENCES "colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_d6e4b3ac1c0c32daad236929eee" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_ca529bfe0dc1551527b3a20a253" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_ca529bfe0dc1551527b3a20a253"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_d6e4b3ac1c0c32daad236929eee"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_c814ee0b6fbf0576539c9236d8f"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_147bc15de4304f89a93c7eee969"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_c67ebaba3e5085b6401911acc70"`);
        await queryRunner.query(`DROP TABLE "order_details"`);
    }

}
