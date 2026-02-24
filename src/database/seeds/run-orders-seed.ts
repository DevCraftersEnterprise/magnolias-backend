import { config } from 'dotenv';
import { AppDataSource } from '../data-source';
import { seedOrders } from './orders.seed';

// Cargar variables de entorno
config();

async function runOrdersSeed() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await AppDataSource.initialize();
    console.log('✅ Conexión establecida\n');

    await seedOrders(AppDataSource);

    console.log('🎉 Seed de pedidos completado');
  } catch (error) {
    console.error('❌ Error ejecutando seed de pedidos:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('👋 Conexión cerrada');
  }
}

runOrdersSeed();
