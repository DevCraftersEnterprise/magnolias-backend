import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductPictureTable1769450671533 implements MigrationInterface {
    name = 'ProductPictureTable1769450671533'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_pictures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "imageUrl" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, "productId" uuid NOT NULL, CONSTRAINT "PK_6cd1270b5bc5be78d744db0be4b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_pictures" ADD CONSTRAINT "FK_0a3caa3b2af25665c469688ca16" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_pictures" ADD CONSTRAINT "FK_70406f844fc00fd83e358094516" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_pictures" ADD CONSTRAINT "FK_e50ee8555bdfac2d6eef6f66ba9" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_pictures" DROP CONSTRAINT "FK_e50ee8555bdfac2d6eef6f66ba9"`);
        await queryRunner.query(`ALTER TABLE "product_pictures" DROP CONSTRAINT "FK_70406f844fc00fd83e358094516"`);
        await queryRunner.query(`ALTER TABLE "product_pictures" DROP CONSTRAINT "FK_0a3caa3b2af25665c469688ca16"`);
        await queryRunner.query(`DROP TABLE "product_pictures"`);
    }

}
