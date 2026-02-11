import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewOrderTypes1770772035758 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new values to the order_type enum
    await queryRunner.query(
      `ALTER TYPE "public"."orders_ordertype_enum" ADD VALUE IF NOT EXISTS 'VITRINA'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."orders_ordertype_enum" ADD VALUE IF NOT EXISTS 'EVENTO'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."orders_ordertype_enum" ADD VALUE IF NOT EXISTS 'PERSONALIZADO'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL does not support removing enum values directly
    // This would require recreating the enum type and updating all references
    // For safety, we'll leave this as a no-op
    console.log(
      'Warning: Removing enum values is not supported. Manual intervention required if needed.',
    );
  }
}
