import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAssistantRole1786000000000
    implements MigrationInterface {
    name = 'RemoveAssistantRole1786000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Cliente #1: el rol ASSISTANT se elimina; los usuarios que lo tenían
        // ya requerían sucursal igual que EMPLOYEE, así que migran a EMPLOYEE.
        await queryRunner.query(
            `UPDATE "users" SET "role" = 'EMPLOYEE' WHERE "role" = 'ASSISTANT'`,
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restaura el valor ASSISTANT en el enum. No se puede restaurar qué
        // usuarios eran ASSISTANT originalmente: up() ya los reasignó a
        // EMPLOYEE y esa información no se conserva.
        await queryRunner.query(
            `ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER', 'ADMIN', 'EMPLOYEE', 'BAKER', 'ASSISTANT')`,
        );
        await queryRunner.query(
            `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::text::"public"."users_role_enum"`,
        );
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
    }
}
