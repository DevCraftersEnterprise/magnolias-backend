import { MigrationInterface, QueryRunner } from "typeorm";

export class DropBakersTable1772149497299 implements MigrationInterface {
    name = 'DropBakersTable1772149497299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminar la tabla bakers (el enum ahora se usa en users)
        await queryRunner.query(`DROP TABLE IF EXISTS "bakers"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recrear la tabla bakers por si se necesita revertir
        await queryRunner.query(`CREATE TABLE "bakers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "area" "public"."users_area_enum" NOT NULL, "specialty" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_94afe7513fb7c961f11f15a1a7a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bakers" ADD CONSTRAINT "FK_b0d2a997f232edc840e481e84cf" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bakers" ADD CONSTRAINT "FK_99473702e5db2ebeb3c6f1bd21a" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
