import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFlowersRalatedTablesAndRelations1770334199834 implements MigrationInterface {
    name = 'CreateFlowersRalatedTablesAndRelations1770334199834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "flowers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_80a68f1514c8c0f64cfaa496ec7" UNIQUE ("name"), CONSTRAINT "PK_5dcdc7d45b8dbbde569c5f3f10c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_flowers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL DEFAULT '1', "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "orderId" uuid NOT NULL, "flowerId" uuid NOT NULL, "colorId" uuid, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_dfd89837268d9804b9996ba977c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "flowers" ADD CONSTRAINT "FK_705fbad9e2d51bf696464c3834c" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "flowers" ADD CONSTRAINT "FK_8bf89dc263d77415f64983e15db" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_flowers" ADD CONSTRAINT "FK_501543b8843c1b4113f527db804" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_flowers" ADD CONSTRAINT "FK_7e69c0cb184299a859695b9c71c" FOREIGN KEY ("flowerId") REFERENCES "flowers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_flowers" ADD CONSTRAINT "FK_1b04f5da9a5a31aef508ea920ff" FOREIGN KEY ("colorId") REFERENCES "colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_flowers" ADD CONSTRAINT "FK_872318d3aec30702feb4c11b82c" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_flowers" ADD CONSTRAINT "FK_c1db1bb66f3fe7bc7646dcb7fa3" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_flowers" DROP CONSTRAINT "FK_c1db1bb66f3fe7bc7646dcb7fa3"`);
        await queryRunner.query(`ALTER TABLE "order_flowers" DROP CONSTRAINT "FK_872318d3aec30702feb4c11b82c"`);
        await queryRunner.query(`ALTER TABLE "order_flowers" DROP CONSTRAINT "FK_1b04f5da9a5a31aef508ea920ff"`);
        await queryRunner.query(`ALTER TABLE "order_flowers" DROP CONSTRAINT "FK_7e69c0cb184299a859695b9c71c"`);
        await queryRunner.query(`ALTER TABLE "order_flowers" DROP CONSTRAINT "FK_501543b8843c1b4113f527db804"`);
        await queryRunner.query(`ALTER TABLE "flowers" DROP CONSTRAINT "FK_8bf89dc263d77415f64983e15db"`);
        await queryRunner.query(`ALTER TABLE "flowers" DROP CONSTRAINT "FK_705fbad9e2d51bf696464c3834c"`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`DROP TABLE "order_flowers"`);
        await queryRunner.query(`DROP TABLE "flowers"`);
    }

}
