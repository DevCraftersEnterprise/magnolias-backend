import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserBakerColumns1772150000000 implements MigrationInterface {
    name = 'AddUserBakerColumns1772150000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Migración de emergencia: Solo agregar columnas faltantes a users

        // 1. Crear el enum si no existe
        const enumExists = await queryRunner.query(`
            SELECT 1 FROM pg_type WHERE typname = 'users_area_enum'
        `);

        if (enumExists.length === 0) {
            await queryRunner.query(`CREATE TYPE "public"."users_area_enum" AS ENUM('BO', 'PA', 'PE', 'CK', '3L')`);
        }

        // 2. Agregar columna area si no existe
        const areaExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'area'
        `);

        if (areaExists.length === 0) {
            await queryRunner.query(`ALTER TABLE "users" ADD "area" "public"."users_area_enum"`);
        }

        // 3. Agregar columna specialty si no existe
        const specialtyExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'specialty'
        `);

        if (specialtyExists.length === 0) {
            await queryRunner.query(`ALTER TABLE "users" ADD "specialty" text`);
        }

        // 4. Agregar columna phone si no existe
        const phoneExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'phone'
        `);

        if (phoneExists.length === 0) {
            await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying(20)`);
        }

        // 5. Crear tabla baker_branches si no existe
        const bakerBranchesExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'baker_branches'
        `);

        if (bakerBranchesExists.length === 0) {
            await queryRunner.query(`CREATE TABLE "baker_branches" ("userId" uuid NOT NULL, "branchId" uuid NOT NULL, CONSTRAINT "PK_e47fd83ad16a768b68f9af98261" PRIMARY KEY ("userId", "branchId"))`);
            await queryRunner.query(`CREATE INDEX "IDX_e4c968ee9ca6689272960e64a3" ON "baker_branches" ("userId")`);
            await queryRunner.query(`CREATE INDEX "IDX_4b4b7ea6eee23af9761abf15a5" ON "baker_branches" ("branchId")`);

            // Agregar FKs solo si la tabla se creó
            await queryRunner.query(`ALTER TABLE "baker_branches" ADD CONSTRAINT "FK_e4c968ee9ca6689272960e64a3a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
            await queryRunner.query(`ALTER TABLE "baker_branches" ADD CONSTRAINT "FK_4b4b7ea6eee23af9761abf15a5e" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir cambios
        const bakerBranchesExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'baker_branches'
        `);

        if (bakerBranchesExists.length > 0) {
            await queryRunner.query(`ALTER TABLE "baker_branches" DROP CONSTRAINT IF EXISTS "FK_4b4b7ea6eee23af9761abf15a5e"`);
            await queryRunner.query(`ALTER TABLE "baker_branches" DROP CONSTRAINT IF EXISTS "FK_e4c968ee9ca6689272960e64a3a"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_4b4b7ea6eee23af9761abf15a5"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_e4c968ee9ca6689272960e64a3"`);
            await queryRunner.query(`DROP TABLE "baker_branches"`);
        }

        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "phone"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "specialty"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "area"`);

        const enumExists = await queryRunner.query(`
            SELECT 1 FROM pg_type WHERE typname = 'users_area_enum'
        `);

        if (enumExists.length > 0) {
            await queryRunner.query(`DROP TYPE "public"."users_area_enum"`);
        }
    }
}
