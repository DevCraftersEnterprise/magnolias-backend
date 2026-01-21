import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableUsers1768955780785 implements MigrationInterface {
    name = 'CreateTableUsers1768955780785'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('super', 'admin', 'employee', 'baker', 'assistant')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "lastname" character varying(255) NOT NULL, "username" character varying(255) NOT NULL, "userkey" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
