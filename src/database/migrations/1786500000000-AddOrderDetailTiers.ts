import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderDetailTiers1786500000000 implements MigrationInterface {
    name = 'AddOrderDetailTiers1786500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TYPE "public"."order_detail_tiers_productsize_enum" AS ENUM('10P', '15P', '20P', '25P', '30P', '40P', '50P', 'CUSTOM')
    `);

        await queryRunner.query(`
      CREATE TABLE "order_detail_tiers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "position" integer NOT NULL,
        "productSize" "public"."order_detail_tiers_productsize_enum",
        "customSize" character varying(100),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "orderDetailId" uuid NOT NULL,
        "breadTypeId" uuid,
        "fillingId" uuid,
        "frostingId" uuid,
        "colorId" uuid,
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        CONSTRAINT "PK_order_detail_tiers" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      ALTER TABLE "order_detail_tiers"
      ADD CONSTRAINT "FK_odt_orderDetail" FOREIGN KEY ("orderDetailId")
      REFERENCES "order_details"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_tiers"
      ADD CONSTRAINT "FK_odt_breadType" FOREIGN KEY ("breadTypeId")
      REFERENCES "bread_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_tiers"
      ADD CONSTRAINT "FK_odt_filling" FOREIGN KEY ("fillingId")
      REFERENCES "fillings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_tiers"
      ADD CONSTRAINT "FK_odt_frosting" FOREIGN KEY ("frostingId")
      REFERENCES "frostings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_tiers"
      ADD CONSTRAINT "FK_odt_color" FOREIGN KEY ("colorId")
      REFERENCES "colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_tiers"
      ADD CONSTRAINT "FK_odt_createdBy" FOREIGN KEY ("createdBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_tiers"
      ADD CONSTRAINT "FK_odt_updatedBy" FOREIGN KEY ("updatedBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "order_detail_tiers"`);
        await queryRunner.query(
            `DROP TYPE "public"."order_detail_tiers_productsize_enum"`,
        );
    }
}
