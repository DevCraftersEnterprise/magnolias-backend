import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateBakersToUsers1772170000000 implements MigrationInterface {
    name = 'MigrateBakersToUsers1772170000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Verificar si existe el enum users_area_enum, si no crearlo
        const enumExists = await queryRunner.query(`
            SELECT 1 FROM pg_type WHERE typname = 'users_area_enum'
        `);

        if (enumExists.length === 0) {
            await queryRunner.query(`
                CREATE TYPE "public"."users_area_enum" AS ENUM('BO', 'PA', 'PE', 'CK', '3L')
            `);
        }

        // 2. Agregar columnas area, specialty, phone a users si no existen
        const areaColumnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='area'
        `);

        if (areaColumnExists.length === 0) {
            await queryRunner.query(`
                ALTER TABLE "users" 
                ADD COLUMN "area" "public"."users_area_enum"
            `);
        }

        const specialtyColumnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='specialty'
        `);

        if (specialtyColumnExists.length === 0) {
            await queryRunner.query(`
                ALTER TABLE "users" 
                ADD COLUMN "specialty" text
            `);
        }

        const phoneColumnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='phone'
        `);

        if (phoneColumnExists.length === 0) {
            await queryRunner.query(`
                ALTER TABLE "users" 
                ADD COLUMN "phone" character varying(15)
            `);
        }

        // 3. Crear tabla baker_branches si no existe
        const bakerBranchesExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'baker_branches'
        `);

        if (bakerBranchesExists.length === 0) {
            await queryRunner.query(`
                CREATE TABLE "baker_branches" (
                    "usersId" uuid NOT NULL,
                    "branchesId" uuid NOT NULL,
                    CONSTRAINT "PK_baker_branches" PRIMARY KEY ("usersId", "branchesId")
                )
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_baker_branches_users" 
                ON "baker_branches" ("usersId")
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_baker_branches_branches" 
                ON "baker_branches" ("branchesId")
            `);

            await queryRunner.query(`
                ALTER TABLE "baker_branches" 
                ADD CONSTRAINT "FK_baker_branches_users" 
                FOREIGN KEY ("usersId") REFERENCES "users"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE
            `);

            await queryRunner.query(`
                ALTER TABLE "baker_branches" 
                ADD CONSTRAINT "FK_baker_branches_branches" 
                FOREIGN KEY ("branchesId") REFERENCES "branches"("id") 
                ON DELETE NO ACTION ON UPDATE NO ACTION
            `);
        }

        // 4. Verificar si existe la tabla bakers
        const bakersTableExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'bakers'
        `);

        if (bakersTableExists.length > 0) {
            // 5. Verificar si existe la FK de order_assignments que apunta a bakers
            const orderAssignmentFKExists = await queryRunner.query(`
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'order_assignments' 
                AND constraint_name = 'FK_6b45c4842e305f35f827e3e2c92'
            `);

            if (orderAssignmentFKExists.length > 0) {
                // 6. Eliminar la FK que apunta a bakers
                await queryRunner.query(`
                    ALTER TABLE "order_assignments" 
                    DROP CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92"
                `);
            }

            // 7. Eliminar la tabla bakers
            await queryRunner.query(`DROP TABLE "bakers"`);
        }

        // 8. Crear o recrear la FK de order_assignments que apunta a users
        const newFKExists = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'order_assignments' 
            AND constraint_name = 'FK_6b45c4842e305f35f827e3e2c92'
        `);

        if (newFKExists.length === 0) {
            await queryRunner.query(`
                ALTER TABLE "order_assignments" 
                ADD CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92" 
                FOREIGN KEY ("bakerId") REFERENCES "users"("id") 
                ON DELETE NO ACTION ON UPDATE NO ACTION
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir es complejo, mejor no revertir esta migración
        throw new Error('Cannot revert this migration');
    }
}
