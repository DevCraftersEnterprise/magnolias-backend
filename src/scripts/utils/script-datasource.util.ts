import { DataSource } from 'typeorm';

/**
 * Builds the postgres `DataSource` used by one-off maintenance scripts
 * (backfills, key rotation) from the standard `DB_*` environment variables.
 * Extracted because `backfill-customer-phone-index.ts` and
 * `rotate-encryption-key.ts` previously duplicated this verbatim, which
 * SonarQube flagged as duplication on new code.
 */
export function buildScriptDataSource(): DataSource {
  return new DataSource({
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
}

/**
 * Connects `dataSource`, runs `task`, and always closes the connection
 * afterwards - the connect/try/finally skeleton shared by every maintenance
 * script in `src/scripts/**`. On error it logs and exits the process,
 * matching each script's previous standalone behavior.
 */
export async function runScript(
  dataSource: DataSource,
  task: () => Promise<void>,
): Promise<void> {
  try {
    console.log('\n🔌 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected!');

    await task();
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
