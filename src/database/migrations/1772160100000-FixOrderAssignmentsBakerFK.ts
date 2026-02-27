import { MigrationInterface, QueryRunner } from "typeorm";

export class FixOrderAssignmentsBakerFK1772160100000 implements MigrationInterface {
    name = 'FixOrderAssignmentsBakerFK1772160100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si existe la FK que apunta a bakers
        const oldFKExists = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'order_assignments' 
            AND constraint_name = 'FK_6b45c4842e305f35f827e3e2c92'
        `);

        if (oldFKExists.length > 0) {
            // Eliminar la FK vieja que apunta a bakers
            await queryRunner.query(`ALTER TABLE "order_assignments" DROP CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92"`);
        }

        // Crear la FK nueva que apunta a users
        await queryRunner.query(`ALTER TABLE "order_assignments" ADD CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92" FOREIGN KEY ("bakerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar la FK que apunta a users
        await queryRunner.query(`ALTER TABLE "order_assignments" DROP CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92"`);

        // Recrear la FK que apunta a bakers (solo si la tabla existe)
        const bakersExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'bakers'
        `);

        if (bakersExists.length > 0) {
            await queryRunner.query(`ALTER TABLE "order_assignments" ADD CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92" FOREIGN KEY ("bakerId") REFERENCES "bakers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
    }
}
