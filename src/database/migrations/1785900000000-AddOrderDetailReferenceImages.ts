import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderDetailReferenceImages1785900000000
    implements MigrationInterface {
    name = 'AddOrderDetailReferenceImages1785900000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "order_detail_reference_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "imageUrl" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "orderDetailId" uuid NOT NULL,
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        CONSTRAINT "PK_order_detail_reference_images" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      ALTER TABLE "order_detail_reference_images"
      ADD CONSTRAINT "FK_odri_orderDetail" FOREIGN KEY ("orderDetailId")
      REFERENCES "order_details"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_reference_images"
      ADD CONSTRAINT "FK_odri_createdBy" FOREIGN KEY ("createdBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_reference_images"
      ADD CONSTRAINT "FK_odri_updatedBy" FOREIGN KEY ("updatedBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        await queryRunner.query(`
      INSERT INTO "order_detail_reference_images"
        ("imageUrl", "orderDetailId", "createdBy", "updatedBy", "createdAt", "updatedAt")
      SELECT "referenceImageUrl", "id", "createdBy", "updatedBy", "createdAt", "updatedAt"
      FROM "order_details"
      WHERE "referenceImageUrl" IS NOT NULL
    `);

        await queryRunner.query(
            `ALTER TABLE "order_details" DROP COLUMN "referenceImageUrl"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "order_details" ADD COLUMN "referenceImageUrl" text`,
        );

        await queryRunner.query(`
      UPDATE "order_details" od
      SET "referenceImageUrl" = latest."imageUrl"
      FROM (
        SELECT DISTINCT ON ("orderDetailId") "orderDetailId", "imageUrl"
        FROM "order_detail_reference_images"
        ORDER BY "orderDetailId", "createdAt" DESC
      ) latest
      WHERE od."id" = latest."orderDetailId"
    `);

        await queryRunner.query(`DROP TABLE "order_detail_reference_images"`);
    }
}
