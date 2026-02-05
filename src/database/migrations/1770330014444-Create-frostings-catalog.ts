import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFrostingsCatalog1770330014444 implements MigrationInterface {
    name = 'CreateFrostingsCatalog1770330014444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "frostings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_57b75f1848bc3282dfd872e7141" UNIQUE ("name"), CONSTRAINT "PK_7571cc54fd339bcb8fbfe2acaea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "frostings" ADD CONSTRAINT "FK_8109448382f10f3c4f5f5af96c5" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "frostings" ADD CONSTRAINT "FK_9991695b532137d1ce36b90b6c6" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "frostings" DROP CONSTRAINT "FK_9991695b532137d1ce36b90b6c6"`);
        await queryRunner.query(`ALTER TABLE "frostings" DROP CONSTRAINT "FK_8109448382f10f3c4f5f5af96c5"`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`DROP TABLE "frostings"`);
    }

}
