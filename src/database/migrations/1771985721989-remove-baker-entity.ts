import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveBakerEntity1771985721989 implements MigrationInterface {
    name = 'RemoveBakerEntity1771985721989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Eliminar foreign keys existentes
        await queryRunner.query(`ALTER TABLE "order_assignments" DROP CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92"`);
        
        // Verificar si existe la constraint de users.bakerId antes de eliminarla
        const usersBakerIdConstraint = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'users' 
            AND constraint_name = 'FK_d7ce6ecd7b646501b4bf501e570'
        `);
        
        if (usersBakerIdConstraint.length > 0) {
            await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_d7ce6ecd7b646501b4bf501e570"`);
        }
        
        // 2. Crear tabla baker_branches
        await queryRunner.query(`CREATE TABLE "baker_branches" ("userId" uuid NOT NULL, "branchId" uuid NOT NULL, CONSTRAINT "PK_e47fd83ad16a768b68f9af98261" PRIMARY KEY ("userId", "branchId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e4c968ee9ca6689272960e64a3" ON "baker_branches" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4b4b7ea6eee23af9761abf15a5" ON "baker_branches" ("branchId") `);
        
        // 3. Eliminar columna bakerId de users si existe
        const usersBakerIdColumn = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'bakerId'
        `);
        
        if (usersBakerIdColumn.length > 0) {
            const uniqueConstraint = await queryRunner.query(`
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'users' 
                AND constraint_name = 'UQ_d7ce6ecd7b646501b4bf501e570'
            `);
            
            if (uniqueConstraint.length > 0) {
                await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_d7ce6ecd7b646501b4bf501e570"`);
            }
            
            await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bakerId"`);
        }
        
        // 4. Agregar nuevas columnas a users
        await queryRunner.query(`CREATE TYPE "public"."users_area_enum" AS ENUM('BO', 'PA', 'PE', 'CK', '3L')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "area" "public"."users_area_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "specialty" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying(20)`);
        
        // 5. Migrar datos de bakers a users si la tabla existe y tiene datos
        const bakersTableExists = await queryRunner.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'bakers'
        `);
        
        if (bakersTableExists.length > 0) {
            // Crear usuarios tipo BAKER para cada registro en la tabla bakers
            await queryRunner.query(`
                INSERT INTO users (id, name, lastname, username, userkey, role, "isActive", area, specialty, phone, "createdAt", "updatedAt", "branchId")
                SELECT 
                    b.id,
                    SPLIT_PART(b."fullName", ' ', 1),
                    SUBSTRING(b."fullName" FROM POSITION(' ' IN b."fullName") + 1),
                    LOWER(REPLACE(b."fullName", ' ', '')),
                    '$2b$10$defaulthashformigratedbakers',
                    'BAKER',
                    b."isActive",
                    b.area,
                    b.specialty,
                    b.phone,
                    b."createdAt",
                    b."updatedAt",
                    NULL
                FROM bakers b
                WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = b.id)
            `);
        }
        
        // 6. Actualizar defaults de orders
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paidAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "dessertsTotal" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "setupServiceCost" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "settlementTotal" SET DEFAULT '0'`);
        
        // 7. Crear nuevas foreign keys
        await queryRunner.query(`ALTER TABLE "order_assignments" ADD CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92" FOREIGN KEY ("bakerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "baker_branches" ADD CONSTRAINT "FK_e4c968ee9ca6689272960e64a3a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "baker_branches" ADD CONSTRAINT "FK_4b4b7ea6eee23af9761abf15a5e" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "baker_branches" DROP CONSTRAINT "FK_4b4b7ea6eee23af9761abf15a5e"`);
        await queryRunner.query(`ALTER TABLE "baker_branches" DROP CONSTRAINT "FK_e4c968ee9ca6689272960e64a3a"`);
        await queryRunner.query(`ALTER TABLE "order_assignments" DROP CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "settlementTotal" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "setupServiceCost" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "dessertsTotal" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paidAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "specialty"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "area"`);
        await queryRunner.query(`DROP TYPE "public"."users_area_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bakerId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_d7ce6ecd7b646501b4bf501e570" UNIQUE ("bakerId")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4b4b7ea6eee23af9761abf15a5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e4c968ee9ca6689272960e64a3"`);
        await queryRunner.query(`DROP TABLE "baker_branches"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_d7ce6ecd7b646501b4bf501e570" FOREIGN KEY ("bakerId") REFERENCES "bakers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_assignments" ADD CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92" FOREIGN KEY ("bakerId") REFERENCES "bakers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
