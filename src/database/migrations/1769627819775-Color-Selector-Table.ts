import { MigrationInterface, QueryRunner } from "typeorm";

export class ColorSelectorTable1769627819775 implements MigrationInterface {
    name = 'ColorSelectorTable1769627819775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "colors" ("id" SERIAL NOT NULL, "value" character varying(7) NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_3a62edc12d29307872ab1777ced" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "colors"`);
    }

}
