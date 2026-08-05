import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderDetailAssignmentsAndProductionStatus1786600000000
    implements MigrationInterface {
    name = 'AddOrderDetailAssignmentsAndProductionStatus1786600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Estado de producción por línea
        await queryRunner.query(`
      CREATE TYPE "public"."order_details_productionstatus_enum" AS ENUM('PENDING', 'IN_PROCESS', 'DONE')
    `);
        await queryRunner.query(`
      ALTER TABLE "order_details"
      ADD COLUMN "productionStatus" "public"."order_details_productionstatus_enum"
      NOT NULL DEFAULT 'PENDING'
    `);

        // 2. Tabla de asignación de repostero por línea
        await queryRunner.query(`
      CREATE TABLE "order_detail_assignments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "assignedDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        "notes" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "bakerId" uuid NOT NULL,
        "orderDetailId" uuid NOT NULL,
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        CONSTRAINT "PK_order_detail_assignments" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_assignments"
      ADD CONSTRAINT "FK_oda_baker" FOREIGN KEY ("bakerId")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_assignments"
      ADD CONSTRAINT "FK_oda_orderDetail" FOREIGN KEY ("orderDetailId")
      REFERENCES "order_details"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_assignments"
      ADD CONSTRAINT "FK_oda_createdBy" FOREIGN KEY ("createdBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_detail_assignments"
      ADD CONSTRAINT "FK_oda_updatedBy" FOREIGN KEY ("updatedBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        // 3. Backfill: replica cada asignación de pedido (OrderAssignment) a
        //    cada una de las líneas de ese pedido.
        await queryRunner.query(`
      INSERT INTO "order_detail_assignments"
        ("id", "bakerId", "orderDetailId", "assignedDate", "notes", "createdBy", "updatedBy", "createdAt", "updatedAt")
      SELECT
        uuid_generate_v4(),
        oa."bakerId",
        od."id",
        oa."assignedDate",
        oa."notes",
        oa."createdBy",
        oa."updatedBy",
        oa."createdAt",
        oa."updatedAt"
      FROM "order_assignments" oa
      INNER JOIN "order_details" od ON od."orderId" = oa."orderId"
    `);

        // 4. Backfill de productionStatus según el status actual del pedido:
        //    IN PROCESS -> IN_PROCESS ; DONE/DELIVERED -> DONE ; CREATED/CANCELED -> PENDING (default)
        await queryRunner.query(`
      UPDATE "order_details" od
      SET "productionStatus" = 'IN_PROCESS'
      FROM "orders" o
      WHERE od."orderId" = o."id" AND o."status" = 'IN PROCESS'
    `);
        await queryRunner.query(`
      UPDATE "order_details" od
      SET "productionStatus" = 'DONE'
      FROM "orders" o
      WHERE od."orderId" = o."id" AND o."status" IN ('DONE', 'DELIVERED')
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "order_detail_assignments" DROP CONSTRAINT "FK_oda_updatedBy"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_detail_assignments" DROP CONSTRAINT "FK_oda_createdBy"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_detail_assignments" DROP CONSTRAINT "FK_oda_orderDetail"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_detail_assignments" DROP CONSTRAINT "FK_oda_baker"`,
        );
        await queryRunner.query(`DROP TABLE "order_detail_assignments"`);
        await queryRunner.query(
            `ALTER TABLE "order_details" DROP COLUMN "productionStatus"`,
        );
        await queryRunner.query(
            `DROP TYPE "public"."order_details_productionstatus_enum"`,
        );
    }
}
