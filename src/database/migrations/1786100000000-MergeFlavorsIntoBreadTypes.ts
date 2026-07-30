import { MigrationInterface, QueryRunner } from 'typeorm';

export class MergeFlavorsIntoBreadTypes1786100000000
    implements MigrationInterface {
    name = 'MergeFlavorsIntoBreadTypes1786100000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Cliente #2: el negocio entiende "tipo de pan" como el sabor del pan,
        // así que el catálogo de sabores se fusiona en bread_types en vez de
        // mantenerse como un campo/catálogo aparte.

        // 1. Cualquier sabor cuyo nombre no exista ya como tipo de pan se
        //    inserta como una nueva fila de bread_types (deduplicado por
        //    nombre — ej. "Chocolate" ya existía en ambas listas).
        await queryRunner.query(`
      INSERT INTO "bread_types" ("id", "name", "description", "isActive", "createdBy", "updatedBy", "createdAt", "updatedAt")
      SELECT uuid_generate_v4(), f."name", f."description", f."isActive", f."createdBy", f."updatedBy", f."createdAt", f."updatedAt"
      FROM "flavors" f
      WHERE NOT EXISTS (
        SELECT 1 FROM "bread_types" bt WHERE bt."name" = f."name"
      )
    `);

        // 2. Para pedidos que ya tenían flavorId pero no breadTypeId, se
        //    rellena breadTypeId con el tipo de pan del mismo nombre.
        //    Si un pedido ya tenía ambos, gana el que ya tenía en
        //    breadTypeId (no se sobrescribe) — decisión del cliente.
        await queryRunner.query(`
      UPDATE "order_details" od
      SET "breadTypeId" = bt."id"
      FROM "flavors" f
      JOIN "bread_types" bt ON bt."name" = f."name"
      WHERE od."flavorId" = f."id"
        AND od."breadTypeId" IS NULL
    `);

        // 3. Se elimina la columna flavorId de order_details.
        await queryRunner.query(
            `ALTER TABLE "order_details" DROP CONSTRAINT "FK_dd5d8772d23de187f3086e74c70"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_details" DROP COLUMN "flavorId"`,
        );

        // 4. Se elimina la tabla flavors por completo.
        await queryRunner.query(`DROP TABLE "flavors"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restaura la forma del esquema (tabla flavors vacía + columna
        // flavorId nullable). No se puede restaurar qué pedidos tenían
        // originalmente un flavorId, ni qué filas de bread_types provenían
        // de un sabor: esa información se pierde en up().
        await queryRunner.query(`
      CREATE TABLE "flavors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        CONSTRAINT "UQ_8297edd7c37e51ab4a4bd8bcbfe" UNIQUE ("name"),
        CONSTRAINT "PK_167d84f2986107e162f56a7ca79" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(
            `ALTER TABLE "flavors" ADD CONSTRAINT "FK_f77cb805483db47f6ba79e69ce6" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "flavors" ADD CONSTRAINT "FK_d2ce0739965391d92a235a017cd" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );

        await queryRunner.query(
            `ALTER TABLE "order_details" ADD COLUMN "flavorId" uuid`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_details" ADD CONSTRAINT "FK_dd5d8772d23de187f3086e74c70" FOREIGN KEY ("flavorId") REFERENCES "flavors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }
}
