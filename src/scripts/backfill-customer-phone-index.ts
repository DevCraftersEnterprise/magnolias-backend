/**
 * Customer Phone Index Backfill Script
 *
 * Decrypts every existing customer's `phone` and populates the new
 * `phoneHash` (deterministic HMAC-SHA256) and `phoneLast4` (plaintext last
 * 4 digits) columns added by migration `AddCustomerPhoneIndexFields`.
 *
 * Prerequisites:
 * 1. Run the `AddCustomerPhoneIndexFields` migration first.
 * 2. ENCRYPTION_KEY must be set (to decrypt the existing `phone` values).
 * 3. PHONE_HASH_SECRET must be set (to compute the new hash).
 * 4. Database connection variables must be set.
 *
 * Usage:
 *   npm run customers:backfill-phone-index
 */

import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { decrypt, isEncrypted } from '../common/utils/encryption.util';
import { buildPhoneIndexFields } from '../common/utils/phone-hash.util';
import { buildScriptDataSource, runScript } from './utils/script-datasource.util';

config();

export interface BackfillStats {
  total: number;
  updated: number;
  skipped: number;
  errors: number;
}

export function validateEnvironment(): void {
  const requiredVars = [
    'ENCRYPTION_KEY',
    'PHONE_HASH_SECRET',
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
}

export async function backfillCustomerPhoneIndex(
  dataSource: DataSource,
): Promise<BackfillStats> {
  const stats: BackfillStats = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  console.log('\n📱 Backfilling customer phone index fields...');

  const customers = await dataSource.query(
    'SELECT id, phone FROM customers',
  );

  stats.total = customers.length;

  for (const customer of customers) {
    try {
      if (!customer.phone) {
        stats.skipped++;
        continue;
      }

      const plainPhone = isEncrypted(customer.phone)
        ? decrypt(customer.phone)
        : customer.phone;

      const { phoneHash, phoneLast4 } = buildPhoneIndexFields(plainPhone);

      await dataSource.query(
        `UPDATE customers SET "phoneHash" = $1, "phoneLast4" = $2 WHERE id = $3`,
        [phoneHash, phoneLast4, customer.id],
      );

      stats.updated++;
      process.stdout.write('.');
    } catch (error) {
      stats.errors++;
      console.error(`\n❌ Error backfilling customer ${customer.id}:`, error);
    }
  }

  console.log('');
  return stats;
}

export function printStats(stats: BackfillStats): void {
  console.log('\n📊 Backfill Summary:');
  console.log('═'.repeat(60));
  console.log(`   Total records: ${stats.total}`);
  console.log(`   ✅ Updated: ${stats.updated}`);
  console.log(`   ⏭️  Skipped (no phone): ${stats.skipped}`);
  console.log(`   ❌ Errors: ${stats.errors}`);
  console.log('═'.repeat(60));

  if (stats.errors > 0) {
    console.log(`\n⚠️  Completed with ${stats.errors} errors. Please review.`);
  } else {
    console.log('\n✅ Phone index backfill completed successfully!');
  }
}

export async function main(): Promise<void> {
  console.log('🔑 Customer Phone Index Backfill Script');
  console.log('═'.repeat(60));

  validateEnvironment();

  const dataSource = buildScriptDataSource();

  await runScript(dataSource, async () => {
    const stats = await backfillCustomerPhoneIndex(dataSource);

    printStats(stats);
  });
}

if (require.main === module) {
  main();
}
