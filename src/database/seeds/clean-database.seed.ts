import { DataSource } from 'typeorm';

export async function cleanDatabase(dataSource: DataSource): Promise<void> {
  const environment = process.env.NODE_ENV;

  // Validar que solo se ejecute en desarrollo o staging
  if (environment !== 'development' && environment !== 'staging') {
    console.warn(
      '⚠️  Limpieza de base de datos solo puede ejecutarse en desarrollo o staging',
    );
    console.warn(`   Entorno actual: ${environment || 'production'}`);
    return;
  }

  console.log('🗑️  Iniciando limpieza de base de datos...');
  console.log('   ⚠️  ADVERTENCIA: Se eliminarán TODOS los datos existentes\n');

  try {
    // Usar TRUNCATE con CASCADE para evitar problemas de foreign keys
    const tables = [
      'product_pictures',
      'products',
      'customers',
      'bakers',
      'bread_types',
      'styles',
      'flowers',
      'frostings',
      'fillings',
      'flavors',
      'categories',
      'colors',
      'branches',
      'phones',
      'users',
    ];

    for (const table of tables) {
      try {
        const result = await dataSource.query(
          `SELECT COUNT(*) as count FROM "${table}"`,
        );
        const count = parseInt(result[0].count);

        if (count > 0) {
          await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE`);
          console.log(`   ✅ ${table}: ${count} registros eliminados`);
        } else {
          console.log(`   ⏭️  ${table}: Sin registros que eliminar`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${table}: Error al limpiar (puede no existir)`);
      }
    }

    console.log('\n✨ Limpieza completada exitosamente\n');
  } catch (error) {
    console.error('❌ Error durante la limpieza de la base de datos:', error);
    throw error;
  }
}
