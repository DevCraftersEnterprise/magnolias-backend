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

    private readonly catalogTables = ['decorations', 'fruits'];

    private async createCatalogTable(
        queryRunner: QueryRunner,
        table: string,
    ): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "${table}" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "price" money NOT NULL DEFAULT 0,
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_${table}_name" UNIQUE ("name"),
        CONSTRAINT "PK_${table}" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "${table}"
      ADD CONSTRAINT "FK_${table}_createdBy" FOREIGN KEY ("createdBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "${table}"
      ADD CONSTRAINT "FK_${table}_updatedBy" FOREIGN KEY ("updatedBy")
      REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    }

    private async dropCatalogTable(
        queryRunner: QueryRunner,
        table: string,
    ): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "${table}" DROP CONSTRAINT "FK_${table}_updatedBy"`,
        );
        await queryRunner.query(
            `ALTER TABLE "${table}" DROP CONSTRAINT "FK_${table}_createdBy"`,
        );
        await queryRunner.query(`DROP TABLE "${table}"`);
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const table of this.catalogTables) {
            await this.createCatalogTable(queryRunner, table);
        }

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

        for (const table of [...this.catalogTables].reverse()) {
            await this.dropCatalogTable(queryRunner, table);
        }
    }
}
