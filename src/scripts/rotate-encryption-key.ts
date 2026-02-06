/**
 * Key Rotation Script
 *
 * This script re-encrypts all sensitive phone data from the old encryption key
 * to a new encryption key. Run this when rotating encryption keys.
 *
 * Prerequisites:
 * 1. Set OLD_ENCRYPTION_KEY in environment (current key)
 * 2. Set NEW_ENCRYPTION_KEY in environment (new key to rotate to)
 * 3. Database connection variables must be set
 *
 * Usage:
 *   npx ts-node src/scripts/rotate-encryption-key.ts
 *
 * After successful rotation:
 * 1. Update ENCRYPTION_KEY to the value of NEW_ENCRYPTION_KEY
 * 2. Remove OLD_ENCRYPTION_KEY and NEW_ENCRYPTION_KEY from environment
 * 3. Deploy the application with the new ENCRYPTION_KEY
 */

import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { reEncrypt, isEncrypted } from '../common/utils/encryption.util';

config();

const OLD_KEY_ENV = 'OLD_ENCRYPTION_KEY';
const NEW_KEY_ENV = 'NEW_ENCRYPTION_KEY';

interface RotationStats {
  table: string;
  total: number;
  rotated: number;
  skipped: number;
  errors: number;
}

function validateEnvironment(): void {
  const requiredVars = [
    OLD_KEY_ENV,
    NEW_KEY_ENV,
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
  ];

  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  if (process.env[OLD_KEY_ENV] === process.env[NEW_KEY_ENV]) {
    throw new Error(
      'OLD_ENCRYPTION_KEY and NEW_ENCRYPTION_KEY must be different',
    );
  }
}

async function rotateCustomerPhones(
  dataSource: DataSource,
): Promise<RotationStats> {
  const stats: RotationStats = {
    table: 'customers',
    total: 0,
    rotated: 0,
    skipped: 0,
    errors: 0,
  };

  console.log('\n📱 Rotating customer phones...');

  const customers = await dataSource.query(
    'SELECT id, phone, "alternativePhone" FROM customers',
  );

  stats.total = customers.length;

  for (const customer of customers) {
    try {
      let updated = false;
      const updates: { phone?: string; alternativePhone?: string } = {};

      // Rotate phone
      if (customer.phone && isEncrypted(customer.phone)) {
        updates.phone = reEncrypt(customer.phone, OLD_KEY_ENV, NEW_KEY_ENV);
        updated = true;
      }

      // Rotate alternativePhone
      if (customer.alternativePhone && isEncrypted(customer.alternativePhone)) {
        updates.alternativePhone = reEncrypt(
          customer.alternativePhone,
          OLD_KEY_ENV,
          NEW_KEY_ENV,
        );
        updated = true;
      }

      if (updated) {
        await dataSource.query(
          `UPDATE customers SET 
            phone = COALESCE($1, phone), 
            "alternativePhone" = COALESCE($2, "alternativePhone") 
          WHERE id = $3`,
          [
            updates.phone || null,
            updates.alternativePhone || null,
            customer.id,
          ],
        );
        stats.rotated++;
        process.stdout.write('.');
      } else {
        stats.skipped++;
      }
    } catch (error) {
      stats.errors++;
      console.error(`\n❌ Error rotating customer ${customer.id}:`, error);
    }
  }

  console.log('');
  return stats;
}

async function rotateOrderPhones(
  dataSource: DataSource,
): Promise<RotationStats> {
  const stats: RotationStats = {
    table: 'orders',
    total: 0,
    rotated: 0,
    skipped: 0,
    errors: 0,
  };

  console.log('\n📦 Rotating order pickup phones...');

  const orders = await dataSource.query(
    'SELECT id, "pickupPersonPhone" FROM orders WHERE "pickupPersonPhone" IS NOT NULL',
  );

  stats.total = orders.length;

  for (const order of orders) {
    try {
      if (order.pickupPersonPhone && isEncrypted(order.pickupPersonPhone)) {
        const newEncrypted = reEncrypt(
          order.pickupPersonPhone,
          OLD_KEY_ENV,
          NEW_KEY_ENV,
        );

        await dataSource.query(
          'UPDATE orders SET "pickupPersonPhone" = $1 WHERE id = $2',
          [newEncrypted, order.id],
        );
        stats.rotated++;
        process.stdout.write('.');
      } else {
        stats.skipped++;
      }
    } catch (error) {
      stats.errors++;
      console.error(`\n❌ Error rotating order ${order.id}:`, error);
    }
  }

  console.log('');
  return stats;
}

function printStats(allStats: RotationStats[]): void {
  console.log('\n📊 Rotation Summary:');
  console.log('═'.repeat(60));

  for (const stats of allStats) {
    console.log(`\n📋 Table: ${stats.table}`);
    console.log(`   Total records: ${stats.total}`);
    console.log(`   ✅ Rotated: ${stats.rotated}`);
    console.log(`   ⏭️  Skipped (not encrypted): ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
  }

  console.log('\n' + '═'.repeat(60));

  const totalErrors = allStats.reduce((sum, s) => sum + s.errors, 0);
  if (totalErrors > 0) {
    console.log(`\n⚠️  Completed with ${totalErrors} errors. Please review.`);
  } else {
    console.log('\n✅ Key rotation completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Set ENCRYPTION_KEY to the value of NEW_ENCRYPTION_KEY');
    console.log('   2. Remove OLD_ENCRYPTION_KEY and NEW_ENCRYPTION_KEY');
    console.log('   3. Deploy the application');
  }
}

async function main(): Promise<void> {
  console.log('🔐 Encryption Key Rotation Script');
  console.log('═'.repeat(60));

  validateEnvironment();

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: true,
    extra: {
      ssl: { rejectUnauthorized: false },
    },
  });

  try {
    console.log('\n🔌 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected!');

    const allStats: RotationStats[] = [];

    // Rotate all encrypted fields
    allStats.push(await rotateCustomerPhones(dataSource));
    allStats.push(await rotateOrderPhones(dataSource));

    printStats(allStats);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n🔌 Database connection closed.');
    }
  }
}

main();
