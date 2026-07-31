import { randomInt } from 'crypto';
import * as argon2 from 'argon2';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchEmployeesAndOrderEmployeeActions1786300000000
    implements MigrationInterface {
    name = 'AddBranchEmployeesAndOrderEmployeeActions1786300000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ── branch_employees ────────────────────────────────────────────────
        await queryRunner.query(`
      CREATE TABLE "branch_employees" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "lastname" character varying(100) NOT NULL,
        "pin" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "branchId" uuid NOT NULL,
        "createdBy" uuid,
        "updatedBy" uuid,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_branch_employees" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      ALTER TABLE "branch_employees"
      ADD CONSTRAINT "FK_be_branch" FOREIGN KEY ("branchId")
      REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "branch_employees"
      ADD CONSTRAINT "FK_be_createdBy" FOREIGN KEY ("createdBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "branch_employees"
      ADD CONSTRAINT "FK_be_updatedBy" FOREIGN KEY ("updatedBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        // ── order_employee_actions ──────────────────────────────────────────
        await queryRunner.query(`
      CREATE TYPE "public"."order_employee_actions_action_enum" AS ENUM('CREATED', 'UPDATED', 'DELIVERED', 'CANCELED')
    `);

        await queryRunner.query(`
      CREATE TABLE "order_employee_actions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action" "public"."order_employee_actions_action_enum" NOT NULL,
        "orderId" uuid NOT NULL,
        "employeeId" uuid NOT NULL,
        "performedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_employee_actions" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      ALTER TABLE "order_employee_actions"
      ADD CONSTRAINT "FK_oea_order" FOREIGN KEY ("orderId")
      REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_employee_actions"
      ADD CONSTRAINT "FK_oea_employee" FOREIGN KEY ("employeeId")
      REFERENCES "branch_employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        // ── Data migration: EMPLOYEE users -> branch_employees ──────────────
        // Cliente #13: el rol EMPLOYEE pasa a ser una cuenta compartida por
        // sucursal; los usuarios EMPLOYEE que ya existían se convierten en
        // registros individuales de branch_employees (con un PIN nuevo, ya
        // que la contraseña original no se puede recuperar de su hash) y su
        // cuenta de login se desactiva. El admin debe crear manualmente,
        // después de esta migración, el nuevo usuario compartido por sucursal.
        const employees: { id: string; name: string; lastname: string; branchId: string }[] =
            await queryRunner.query(`
        SELECT "id", "name", "lastname", "branchId"
        FROM "users"
        WHERE "role" = 'EMPLOYEE' AND "isActive" = true AND "branchId" IS NOT NULL
      `);

        if (employees.length > 0) {
            console.log(
                `\n[AddBranchEmployeesAndOrderEmployeeActions] Generando PIN para ${employees.length} empleado(s) migrado(s):`,
            );
        }

        for (const employee of employees) {
            const pin = String(randomInt(1000, 10000));
            const hashedPin = await argon2.hash(pin);

            await queryRunner.query(
                `INSERT INTO "branch_employees" ("name", "lastname", "pin", "branchId")
         VALUES ($1, $2, $3, $4)`,
                [employee.name, employee.lastname, hashedPin, employee.branchId],
            );

            await queryRunner.query(
                `UPDATE "users" SET "isActive" = false WHERE "id" = $1`,
                [employee.id],
            );

            console.log(
                `  - ${employee.name} ${employee.lastname} (sucursal ${employee.branchId}): PIN ${pin}`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "order_employee_actions" DROP CONSTRAINT "FK_oea_employee"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_employee_actions" DROP CONSTRAINT "FK_oea_order"`,
        );
        await queryRunner.query(`DROP TABLE "order_employee_actions"`);
        await queryRunner.query(
            `DROP TYPE "public"."order_employee_actions_action_enum"`,
        );

        await queryRunner.query(
            `ALTER TABLE "branch_employees" DROP CONSTRAINT "FK_be_updatedBy"`,
        );
        await queryRunner.query(
            `ALTER TABLE "branch_employees" DROP CONSTRAINT "FK_be_createdBy"`,
        );
        await queryRunner.query(
            `ALTER TABLE "branch_employees" DROP CONSTRAINT "FK_be_branch"`,
        );
        await queryRunner.query(`DROP TABLE "branch_employees"`);

        // No se puede restaurar qué usuarios EMPLOYEE estaban activos antes de
        // esta migración ni recuperar sus PINs (quedaron hasheados y la tabla
        // que los contenía ya se eliminó arriba) — down() no reactiva usuarios.
    }
}
