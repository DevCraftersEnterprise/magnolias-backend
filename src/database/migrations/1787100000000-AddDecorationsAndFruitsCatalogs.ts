import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cliente #2: dos catálogos nuevos, "Decoración" y "Fruta", con el mismo
 * shape que los demás catálogos base (incluye `price`, ya agregado a
 * BaseCatalogEntity en AddPriceToCatalogs). Se agregan además las FKs
 * opcionales `decorationId`/`fruitId` a `order_details`, siguiendo el mismo
 * patrón que `styleId`.
 */
export class AddDecorationsAndFruitsCatalogs1787100000000
    implements MigrationInterface {
    name = 'AddDecorationsAndFruitsCatalogs1787100000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ── decorations ──────────────────────────────────────────────────────
        await queryRunner.query(`
      CREATE TABLE "decorations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "price" money NOT NULL DEFAULT 0,
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_decorations_name" UNIQUE ("name"),
        CONSTRAINT "PK_decorations" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "decorations"
      ADD CONSTRAINT "FK_decorations_createdBy" FOREIGN KEY ("createdBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "decorations"
      ADD CONSTRAINT "FK_decorations_updatedBy" FOREIGN KEY ("updatedBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        // ── fruits ───────────────────────────────────────────────────────────
        await queryRunner.query(`
      CREATE TABLE "fruits" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "price" money NOT NULL DEFAULT 0,
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_fruits_name" UNIQUE ("name"),
        CONSTRAINT "PK_fruits" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "fruits"
      ADD CONSTRAINT "FK_fruits_createdBy" FOREIGN KEY ("createdBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "fruits"
      ADD CONSTRAINT "FK_fruits_updatedBy" FOREIGN KEY ("updatedBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        // ── order_details.decorationId / fruitId ────────────────────────────
        await queryRunner.query(`
      ALTER TABLE "order_details" ADD "decorationId" uuid
    `);
        await queryRunner.query(`
      ALTER TABLE "order_details" ADD "fruitId" uuid
    `);
        await queryRunner.query(`
      ALTER TABLE "order_details"
      ADD CONSTRAINT "FK_order_details_decorationId" FOREIGN KEY ("decorationId")
      REFERENCES "decorations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "order_details"
      ADD CONSTRAINT "FK_order_details_fruitId" FOREIGN KEY ("fruitId")
      REFERENCES "fruits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "order_details" DROP CONSTRAINT "FK_order_details_fruitId"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_details" DROP CONSTRAINT "FK_order_details_decorationId"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_details" DROP COLUMN "fruitId"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_details" DROP COLUMN "decorationId"`,
        );

        await queryRunner.query(
            `ALTER TABLE "fruits" DROP CONSTRAINT "FK_fruits_updatedBy"`,
        );
        await queryRunner.query(
            `ALTER TABLE "fruits" DROP CONSTRAINT "FK_fruits_createdBy"`,
        );
        await queryRunner.query(`DROP TABLE "fruits"`);

        await queryRunner.query(
            `ALTER TABLE "decorations" DROP CONSTRAINT "FK_decorations_updatedBy"`,
        );
        await queryRunner.query(
            `ALTER TABLE "decorations" DROP CONSTRAINT "FK_decorations_createdBy"`,
        );
        await queryRunner.query(`DROP TABLE "decorations"`);
    }
}
