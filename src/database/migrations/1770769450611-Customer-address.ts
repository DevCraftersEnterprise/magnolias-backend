import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomerAddress1770769450611 implements MigrationInterface {
    name = 'CustomerAddress1770769450611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customer_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "street" character varying(255) NOT NULL, "number" character varying(50) NOT NULL, "neighborhood" character varying(255) NOT NULL, "city" character varying(150), "postalCode" character varying(10), "interphoneCode" character varying(50), "beetweenStreets" character varying(255), "reference" text, "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "customerId" uuid, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "REL_7bd088b1c8d3506953240ebf03" UNIQUE ("customerId"), CONSTRAINT "PK_336bda7b0a0cd04241f719fc834" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "alternativeAddress"`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "customer_addresses" ADD CONSTRAINT "FK_7bd088b1c8d3506953240ebf030" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_addresses" ADD CONSTRAINT "FK_e49fdf2489980fc4543f44b2112" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_addresses" ADD CONSTRAINT "FK_2f672e5bcaa1ff8d83225e1e6ef" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_addresses" DROP CONSTRAINT "FK_2f672e5bcaa1ff8d83225e1e6ef"`);
        await queryRunner.query(`ALTER TABLE "customer_addresses" DROP CONSTRAINT "FK_e49fdf2489980fc4543f44b2112"`);
        await queryRunner.query(`ALTER TABLE "customer_addresses" DROP CONSTRAINT "FK_7bd088b1c8d3506953240ebf030"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "alternativeAddress" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "address" character varying(255)`);
        await queryRunner.query(`DROP TABLE "customer_addresses"`);
    }

}
