import { MigrationInterface, QueryRunner } from "typeorm";

export class BranchesEntityAndRelationWithUsers1769103718471 implements MigrationInterface {
    name = 'BranchesEntityAndRelationWithUsers1769103718471'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "address" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "branchId" uuid`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_22588392f3b0b7e89180edae031" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_6b68e31b0b8cd37ee27a27c9792" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_246426dfd001466a1d5e47322f4" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_246426dfd001466a1d5e47322f4"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_6b68e31b0b8cd37ee27a27c9792"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_22588392f3b0b7e89180edae031"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "branchId"`);
        await queryRunner.query(`DROP TABLE "branches"`);
    }

}
