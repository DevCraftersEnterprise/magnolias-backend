import { config } from 'dotenv';
import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';

// Services
import { BranchesService } from '../../branches/branches.service';
import { UsersService } from '../../users/users.service';

// Entities
import { Branch } from '../../branches/entities/branch.entity';
import { Phone } from '../../branches/entities/phone.entity';
import { User } from '../../users/entities/user.entity';

// Use Cases
import { CreateBranchUseCase } from '../../branches/usecases/branch/create-branch.usecase';
import { FindAllBranchesUseCase } from '../../branches/usecases/branch/find-all-branches.usecase';
import { FindOneBranchUseCase } from '../../branches/usecases/branch/find-one-branch.usecase';
import { RemoveBranchUseCase } from '../../branches/usecases/branch/remove-branch.usecase';
import { UpdateBranchUseCase } from '../../branches/usecases/branch/update-branch.usecase';
import { CreatePhoneForBranchUseCase } from '../../branches/usecases/phones/create-phone-for-branch.usecase';
import { UpdatePhoneForBranchUseCase } from '../../branches/usecases/phones/update-phone-for-branch.usecase';
import { RegisterUserUseCase } from '../../users/usecases/register-user.usecase';

// Seeds
import { seedBranches } from './branches.seed';
import { cleanDatabase } from './clean-database.seed';
import { seedInitialUsers } from './initial-users.seed';

// Cargar variables de entorno
config();

async function runSeeds() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await AppDataSource.initialize();

    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const branchRepository: Repository<Branch> = AppDataSource.getRepository(Branch);
    const phoneRepository: Repository<Phone> = AppDataSource.getRepository(Phone);

    const registerUserUseCase = new RegisterUserUseCase(userRepository, branchRepository);
    const createBranchUseCase = new CreateBranchUseCase(branchRepository);
    const findAllBranchesUseCase = new FindAllBranchesUseCase(branchRepository);
    const findOneBranchUseCase = new FindOneBranchUseCase(branchRepository);
    const updateBranchUseCase = new UpdateBranchUseCase(branchRepository);
    const removeBranchUseCase = new RemoveBranchUseCase(branchRepository);
    const createPhoneForBranchUseCase = new CreatePhoneForBranchUseCase(branchRepository, phoneRepository);
    const updatePhoneForBranchUseCase = new UpdatePhoneForBranchUseCase(phoneRepository);

    const branchesService = new BranchesService(
      createBranchUseCase,
      findAllBranchesUseCase,
      findOneBranchUseCase,
      updateBranchUseCase,
      removeBranchUseCase,
      createPhoneForBranchUseCase,
      updatePhoneForBranchUseCase
    );

    const usersService = new UsersService(userRepository, branchesService, registerUserUseCase);

    console.log('✅ Conexión establecida\n');

    console.log('════════════════════════════════════════════════════');
    console.log('         🌱 INICIANDO PROCESO DE SEEDS');
    console.log('════════════════════════════════════════════════════\n');
    // 0. Limpiar base de datos
    await cleanDatabase(AppDataSource);

    // 1. Usuarios iniciales (necesarios para crear otros registros)
    await seedInitialUsers(usersService, userRepository);

    // 2. Sucursales (necesita usuarios)
    await seedBranches(branchesService, userRepository, branchRepository);

    // 3. Usuarios adicionales (necesita sucursales para empleados)
    //await seedExtraUsers(AppDataSource);

    // 4. Categorías (necesita usuarios)
    // await seedCategories(AppDataSource);

    // 5. Colores (independiente)
    // await seedColors(AppDataSource);

    // 6. Ingredientes y opciones (todos necesitan usuarios)
    // await seedFlavors(AppDataSource);
    // await seedFillings(AppDataSource);
    // await seedFrostings(AppDataSource);
    // await seedFlowers(AppDataSource);
    // await seedStyles(AppDataSource);
    // await seedBreadTypes(AppDataSource);

    // 7. Pasteleros (necesita usuarios)
    // await seedBakers(AppDataSource);

    // 8. Usuarios panaderos (necesita pasteleros)
    // await seedBakerUsers(AppDataSource);

    // 9. Clientes (necesita usuarios)
    // await seedCustomers(AppDataSource);

    // 10. Productos (necesita categorías y usuarios)
    // await seedProducts(AppDataSource);

    // 11. Pedidos (necesita clientes, sucursales, productos y usuarios)
    // await seedOrders(AppDataSource);

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
