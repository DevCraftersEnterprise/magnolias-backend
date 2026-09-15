import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cliente #8: integración de repartidores como rol completo. Agrega el
 * valor DRIVER al enum de roles y la tabla de asignación de repartidor
 * por pedido (a nivel de pedido completo, no por línea), espejo de
 * order_assignments/order_detail_assignments.
 */
export class AddDriverRoleAndDeliveryAssignments1787400000000
    implements MigrationInterface {
    name = 'AddDriverRoleAndDeliveryAssignments1787400000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TYPE "public"."users_role_enum" ADD VALUE 'DRIVER'
    `);

        await queryRunner.query(`
      CREATE TABLE "order_delivery_assignments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "assignedDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        "notes" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "driverId" uuid NOT NULL,
        "orderId" uuid NOT NULL,
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        CONSTRAINT "PK_order_delivery_assignments" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "order_delivery_assignments"
      ADD CONSTRAINT "FK_odla_driver" FOREIGN KEY ("driverId")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_delivery_assignments"
      ADD CONSTRAINT "FK_odla_order" FOREIGN KEY ("orderId")
      REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_delivery_assignments"
      ADD CONSTRAINT "FK_odla_createdBy" FOREIGN KEY ("createdBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_delivery_assignments"
      ADD CONSTRAINT "FK_odla_updatedBy" FOREIGN KEY ("updatedBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "order_delivery_assignments" DROP CONSTRAINT "FK_odla_updatedBy"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_delivery_assignments" DROP CONSTRAINT "FK_odla_createdBy"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_delivery_assignments" DROP CONSTRAINT "FK_odla_order"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_delivery_assignments" DROP CONSTRAINT "FK_odla_driver"`,
        );
        await queryRunner.query(`DROP TABLE "order_delivery_assignments"`);

        // Postgres no soporta quitar un valor de un enum directamente: hay que
        // recrear el tipo sin él (mismo mecanismo que RemoveAssistantRole).
        await queryRunner.query(
            `UPDATE "users" SET "role" = 'BAKER' WHERE "role" = 'DRIVER'`,
        );
        await queryRunner.query(
            `ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER', 'ADMIN', 'EMPLOYEE', 'BAKER')`,
        );
        await queryRunner.query(
            `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::text::"public"."users_role_enum"`,
        );
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
    }
}
