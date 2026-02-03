import { MigrationInterface, QueryRunner } from "typeorm";

export class PhonesEntityAndRelation1770140903441 implements MigrationInterface {
    name = 'PhonesEntityAndRelation1770140903441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "phones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone1" text NOT NULL, "phone2" text, "whatsapp" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "branchId" uuid NOT NULL, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "REL_b5a41150ed03b76c81de795815" UNIQUE ("branchId"), CONSTRAINT "PK_30d7fc09a458d7a4d9471bda554" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "phoneId" uuid`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "UQ_4fc2dfa7df2b760d9f452f8f9d6" UNIQUE ("phoneId")`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "phones" ADD CONSTRAINT "FK_b5a41150ed03b76c81de795815b" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "phones" ADD CONSTRAINT "FK_c3f04379175097eff95952695cc" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "phones" ADD CONSTRAINT "FK_c3b7838c592382fcccdee28f514" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_4fc2dfa7df2b760d9f452f8f9d6" FOREIGN KEY ("phoneId") REFERENCES "phones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_4fc2dfa7df2b760d9f452f8f9d6"`);
        await queryRunner.query(`ALTER TABLE "phones" DROP CONSTRAINT "FK_c3b7838c592382fcccdee28f514"`);
        await queryRunner.query(`ALTER TABLE "phones" DROP CONSTRAINT "FK_c3f04379175097eff95952695cc"`);
        await queryRunner.query(`ALTER TABLE "phones" DROP CONSTRAINT "FK_b5a41150ed03b76c81de795815b"`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "UQ_4fc2dfa7df2b760d9f452f8f9d6"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "phoneId"`);
        await queryRunner.query(`DROP TABLE "phones"`);
    }

}
