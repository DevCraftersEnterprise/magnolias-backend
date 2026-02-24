import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAddressesAndOrderFields1770770758520 implements MigrationInterface {
    name = 'AddAddressesAndOrderFields1770770758520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "order_delivery_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "street" character varying(255) NOT NULL, "number" character varying(50) NOT NULL, "neighborhood" character varying(255) NOT NULL, "city" character varying(100), "postalCode" character varying(10), "interphoneCode" character varying(50), "betweenStreets" character varying(255), "reference" text, "deliveryNotes" text, "receiverName" character varying(255), "receiverPhone" character varying(50), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "commonAddressId" uuid, "orderId" uuid, CONSTRAINT "REL_16526c174acc0441f4eee0bb54" UNIQUE ("orderId"), CONSTRAINT "PK_e09cc92cb1d8e8a863f71dfba2a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "pickupPersonName"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deliveryAddress"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deliveryNotes"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "pickupPersonPhone"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "readyTime" TIME`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "eventTime" TIME`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "setupTime" TIME`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "branchDepartureTime" TIME`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "collectionDateTime" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "setupPersonName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "eventServices" text`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "guestCount" integer`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "paidAmount" money NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "dessertsTotal" money NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "setupServiceCost" money NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "hasPhotoReference" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "ticketNumber" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "settlementTicketNumber" character varying(50)`);
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentmethod_enum" AS ENUM('CASH', 'CARD', 'TRANSFER', 'MIXED')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "paymentMethod" "public"."orders_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "transferAccount" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "requiresInvoice" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "settlementDate" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "settlementTotal" money NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_delivery_addresses" ADD CONSTRAINT "FK_61a6f6d3930140ab9c2f11aa77c" FOREIGN KEY ("commonAddressId") REFERENCES "common_addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_delivery_addresses" ADD CONSTRAINT "FK_16526c174acc0441f4eee0bb54f" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_delivery_addresses" DROP CONSTRAINT "FK_16526c174acc0441f4eee0bb54f"`);
        await queryRunner.query(`ALTER TABLE "order_delivery_addresses" DROP CONSTRAINT "FK_61a6f6d3930140ab9c2f11aa77c"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "remainingBalance" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "advancePayment" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "totalAmount" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "order_details" ALTER COLUMN "price" SET DEFAULT '$0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "settlementTotal"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "settlementDate"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "requiresInvoice"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "transferAccount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paymentMethod"`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "settlementTicketNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "ticketNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "hasPhotoReference"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "setupServiceCost"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "dessertsTotal"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paidAmount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "guestCount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "eventServices"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "setupPersonName"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "collectionDateTime"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "branchDepartureTime"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "setupTime"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "eventTime"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "readyTime"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "pickupPersonPhone" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "deliveryNotes" text`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "deliveryAddress" text`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "pickupPersonName" character varying(255)`);
        await queryRunner.query(`DROP TABLE "order_delivery_addresses"`);
    }

}
