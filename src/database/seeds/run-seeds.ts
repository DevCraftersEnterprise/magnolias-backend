import { config } from 'dotenv';
import { AppDataSource } from '../data-source';
import { seedBakers } from './bakers.seed';
import { seedBakerUsers } from './baker-users.seed';
import { seedBranches } from './branches.seed';
import { seedBreadTypes } from './bread-types.seed';
import { seedCategories } from './categories.seed';
import { cleanDatabase } from './clean-database.seed';
import { seedColors } from './colors.seed';
import { seedCustomers } from './customers.seed';
import { seedExtraUsers } from './extra-users.seed';
import { seedFillings } from './fillings.seed';
import { seedFlavors } from './flavors.seed';
import { seedFlowers } from './flowers.seed';
import { seedFrostings } from './frostings.seed';
import { seedInitialUsers } from './initial-users.seed';
import { seedProducts } from './products.seed';
import { seedStyles } from './styles.seed';

// Cargar variables de entorno
config();

async function runSeeds() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await AppDataSource.initialize();
    console.log('✅ Conexión establecida\n');

    console.log('════════════════════════════════════════════════════');
    console.log('         🌱 INICIANDO PROCESO DE SEEDS');
    console.log('════════════════════════════════════════════════════\n');
    // 0. Limpiar base de datos
    await cleanDatabase(AppDataSource);

    //
    // 1. Usuarios iniciales (necesarios para crear otros registros)
    await seedInitialUsers(AppDataSource);

    // 2. Sucursales (necesita usuarios)
    await seedBranches(AppDataSource);

    // 3. Usuarios adicionales (necesita sucursales para empleados)
    await seedExtraUsers(AppDataSource);

    // 4. Categorías (necesita usuarios)
    await seedCategories(AppDataSource);

    // 5. Colores (independiente)
    await seedColors(AppDataSource);

    // 6. Ingredientes y opciones (todos necesitan usuarios)
    await seedFlavors(AppDataSource);
    await seedFillings(AppDataSource);
    await seedFrostings(AppDataSource);
    await seedFlowers(AppDataSource);
    await seedStyles(AppDataSource);
    await seedBreadTypes(AppDataSource);

    // 7. Pasteleros (necesita usuarios)
    await seedBakers(AppDataSource);

    // 8. Usuarios panaderos (necesita pasteleros)
    await seedBakerUsers(AppDataSource);

    // 9. Clientes (necesita usuarios)
    await seedCustomers(AppDataSource);

    // 10. Productos (necesita categorías y usuarios)
    await seedProducts(AppDataSource);

    console.log('════════════════════════════════════════════════════');
    console.log('    🎉 TODOS LOS SEEDS SE EJECUTARON CORRECTAMENTE');
    console.log('════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n════════════════════════════════════════════════════');
    console.error('           ❌ ERROR EJECUTANDO SEEDS');
    console.error('════════════════════════════════════════════════════');
    console.error(error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('👋 Conexión cerrada\n');
  }
}

runSeeds();
