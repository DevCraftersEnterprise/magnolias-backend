import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderCancellationTable1769670802622 implements MigrationInterface {
    name = 'OrderCancellationTable1769670802622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "orders_cancellations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "canceledAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "orderId" uuid NOT NULL, "canceledBy" uuid NOT NULL, CONSTRAINT "PK_224f6783bbf5078463d40a51819" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders_cancellations" ADD CONSTRAINT "FK_6b7f173d3defeca9e6bdeaab0f9" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders_cancellations" ADD CONSTRAINT "FK_8dfae8f608f4dee283325faa3c3" FOREIGN KEY ("canceledBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders_cancellations" DROP CONSTRAINT "FK_8dfae8f608f4dee283325faa3c3"`);
        await queryRunner.query(`ALTER TABLE "orders_cancellations" DROP CONSTRAINT "FK_6b7f173d3defeca9e6bdeaab0f9"`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`DROP TABLE "orders_cancellations"`);
    }

}
