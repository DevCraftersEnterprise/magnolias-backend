import { config } from 'dotenv';
import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';

// Services
import { BranchesService } from '../../branches/branches.service';
import { UsersService } from '../../users/users.service';
import { CategoriesService } from '../../categories/categories.service'
import { ColorsService } from '../../colors/colors.service';
import { FlavorsService } from '../../flavors/flavors.service';
import { FillingsService } from '../../fillings/fillings.service';
import { FrostingsService } from '../../frostings/frostings.service';
import { FlowersService } from '../../flowers/flowers.service';
import { StylesService } from '../../styles/styles.service';
import { BreadTypesService } from '../../bread-types/bread-types.service';
import { CustomersService } from '../../customers/customers.service';

// Entities
import { Branch } from '../../branches/entities/branch.entity';
import { Phone } from '../../branches/entities/phone.entity';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Color } from '../../colors/entities/color.entity';
import { Flavor } from '../../flavors/entities/flavor.entity';
import { Filling } from '../../fillings/entities/filling.entity';
import { Frosting } from '../../frostings/entities/frosting.entity';
import { Flower } from '../../flowers/entities/flower.entity';
import { Style } from '../../styles/entities/style.entity';
import { BreadType } from '../../bread-types/entities/bread-type.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { CustomerAddress } from '../../customers/entities/customer-address.entity';

// Use Cases
import { CreateBranchUseCase } from '../../branches/usecases/branch/create-branch.usecase';
import { FindAllUsersUseCase } from '../../users/usecases/find-all-users.usecase';
import { FindOneUserUseCase } from '../../users/usecases/find-one-user.usecase';
import { UpdateUserUseCase } from '../../users/usecases/update-user.usecase';
import { RemoveUserUseCase } from '../../users/usecases/remove-user.usecase';
import { ResetPasswordForUserUseCase } from '../../users/usecases/reset-password-for-user.usecase'

import { FindAllBranchesUseCase } from '../../branches/usecases/branch/find-all-branches.usecase';
import { FindOneBranchUseCase } from '../../branches/usecases/branch/find-one-branch.usecase';
import { RemoveBranchUseCase } from '../../branches/usecases/branch/remove-branch.usecase';
import { UpdateBranchUseCase } from '../../branches/usecases/branch/update-branch.usecase';
import { CreatePhoneForBranchUseCase } from '../../branches/usecases/phones/create-phone-for-branch.usecase';
import { UpdatePhoneForBranchUseCase } from '../../branches/usecases/phones/update-phone-for-branch.usecase';
import { RegisterUserUseCase } from '../../users/usecases/register-user.usecase';

import { CreateCategoryUseCase } from '../../categories/usecases/create-category.usecase';
import { FindAllCategoriesUseCase } from '../../categories/usecases/find-all-categories.usecase';
import { FindOneCategoryUseCase } from '../../categories/usecases/find-one-category.usecase';
import { UpdateCategoryUseCase } from '../../categories/usecases/update-category.usecase';
import { RemoveCategoryUseCase } from '../../categories/usecases/remove-category.usecase';

import { CreateColorUseCase } from '../../colors/usecases/create-color.usecase';
import { FindAllColorsUseCase } from '../../colors/usecases/find-all-colors.usecase';

import { CreateFlavorUseCase } from '../../flavors/usecases/create-flavor.usecase';
import { FindAllFlavorsUseCase } from '../../flavors/usecases/find-all-flavors.usecase';
import { FindOneFlavorUseCase } from '../../flavors/usecases/find-one-flavor.usecase';
import { UpdateFlavorUseCase } from '../../flavors/usecases/update-flavor.usecase';
import { RemoveFlavorUseCase } from '../../flavors/usecases/remove-flavor.usecase';

import { CreateFillingUseCase } from '../../fillings/usecases/create-filling.usecase';
import { FindAllFillingsUseCase } from '../../fillings/usecases/find-all-fillings.usecase';
import { FindOneFillingUseCase } from '../../fillings/usecases/find-one-filling.usecase';
import { UpdateFillingUseCase } from '../../fillings/usecases/update-filling.usecase';
import { RemoveFillingUseCase } from '../../fillings/usecases/remove-filling.usecase';

import { CreateFrostingUseCase } from '../../frostings/usecases/create-frosting.usecase';
import { FindAllFrostingsUseCase } from '../../frostings/usecases/find-all-frostings.usecase';
import { FindOneFrostingUseCase } from '../../frostings/usecases/find-one-frosting.usecase';
import { UpdateFrostingUseCase } from '../../frostings/usecases/update-frosting.usecase';
import { RemoveFrostingUseCase } from '../../frostings/usecases/remove-frosting.usecase';

import { CreateFlowerUseCase } from '../../flowers/usecases/create-flower.usecase';
import { FindAllFlowersUseCase } from '../../flowers/usecases/find-all-flowers.usecase';
import { FindOneFlowerUseCase } from '../../flowers/usecases/find-one-flower.usecase';
import { RemoveFlowerUseCase } from '../../flowers/usecases/remove-flower.usecase';
import { UpdateFlowerUseCase } from '../../flowers/usecases/update-flower.usecase';

import { CreateStyleUseCase } from '../../styles/usecases/create-style.usecase';
import { FindAllStylesUseCase } from '../../styles/usecases/find-all-styles.usecase';
import { FindOneStyleUseCase } from '../../styles/usecases/find-one-style.usecase';
import { UpdateStyleUseCase } from '../../styles/usecases/update-style.usecase';
import { RemoveStyleUseCase } from '../../styles/usecases/remove-style.usecase';

import { CreateBreadTypeUseCase } from '../../bread-types/usecases/create-bread-type.usecase';
import { FindAllBreadTypesUseCase } from '../../bread-types/usecases/find-all-bread-types.usecase';
import { FindOneBreadTypeUseCase } from '../../bread-types/usecases/find-one-bread-type.usecase';
import { RemoveBreadTypeUseCase } from '../../bread-types/usecases/remove-bread-type.usecase';
import { UpdateBreadTypeUseCase } from '../../bread-types/usecases/update-bread-type.usecase';

import { CreateCustomerUseCase } from '../../customers/usecases/create-customer.usecase';
import { FindAllCustomersUseCase } from '../../customers/usecases/find-all-customers.usecase';
import { FindOneCustomerUseCase } from '../../customers/usecases/find-one-customer.usecase';
import { UpdateCustomerUseCase } from '../../customers/usecases/update-customer.usecase';
import { RemoveCustomerUseCase } from '../../customers/usecases/remove-customer.usecase';
// Seeds
import { cleanDatabase } from './clean-database.seed';
import { seedInitialUsers } from './initial-users.seed';
import { seedBranches } from './branches.seed';
import { seedExtraUsers } from './extra-users.seed';
import { seedCategories } from './categories.seed';
import { seedColors } from './colors.seed';
import { seedFlavors } from './flavors.seed';
import { seedFillings } from './fillings.seed';
import { seedFrostings } from './frostings.seed';
import { seedFlowers } from './flowers.seed';
import { seedStyles } from './styles.seed';
import { seedBreadTypes } from './bread-types.seed';
import { seedCustomers } from './customers.seed';

// Cargar variables de entorno
config();

async function runSeeds() {
  try {
    const environment = process.env.NODE_ENV;
    console.log('🔧 Conectando a la base de datos...');
    await AppDataSource.initialize();

    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const branchRepository: Repository<Branch> = AppDataSource.getRepository(Branch);
    const phoneRepository: Repository<Phone> = AppDataSource.getRepository(Phone);
    const categoryRepository: Repository<Category> = AppDataSource.getRepository(Category);
    const colorRepository: Repository<Color> = AppDataSource.getRepository(Color);
    const flavorRepository: Repository<Flavor> = AppDataSource.getRepository(Flavor);
    const fillingRepository: Repository<Filling> = AppDataSource.getRepository(Filling);
    const frostingRepository: Repository<Frosting> = AppDataSource.getRepository(Frosting);
    const flowerRepository: Repository<Flower> = AppDataSource.getRepository(Flower);
    const styleRepository: Repository<Style> = AppDataSource.getRepository(Style);
    const breadTypeRepository: Repository<BreadType> = AppDataSource.getRepository(BreadType);
    const customerRepository: Repository<Customer> = AppDataSource.getRepository(Customer);
    const customerAddressRepository: Repository<CustomerAddress> = AppDataSource.getRepository(CustomerAddress);

    const registerUserUseCase = new RegisterUserUseCase(userRepository, branchRepository);
    const findAllUsersUseCase = new FindAllUsersUseCase(userRepository);
    const findOneUserUseCase = new FindOneUserUseCase(userRepository);
    const updateUserUseCase = new UpdateUserUseCase(userRepository, branchRepository);
    const removeUserUseCase = new RemoveUserUseCase(userRepository);
    const resetPasswordForUserUseCase = new ResetPasswordForUserUseCase(userRepository);

    const createBranchUseCase = new CreateBranchUseCase(branchRepository);
    const findAllBranchesUseCase = new FindAllBranchesUseCase(branchRepository);
    const findOneBranchUseCase = new FindOneBranchUseCase(branchRepository);
    const updateBranchUseCase = new UpdateBranchUseCase(branchRepository);
    const removeBranchUseCase = new RemoveBranchUseCase(branchRepository);
    const createPhoneForBranchUseCase = new CreatePhoneForBranchUseCase(branchRepository, phoneRepository);
    const updatePhoneForBranchUseCase = new UpdatePhoneForBranchUseCase(phoneRepository);

    const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
    const findAllCategoriesUseCase = new FindAllCategoriesUseCase(categoryRepository);
    const findOneCategoryUseCase = new FindOneCategoryUseCase(categoryRepository);
    const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
    const removeCategoryUseCase = new RemoveCategoryUseCase(categoryRepository);

    const createColorUseCase = new CreateColorUseCase(colorRepository);
    const findAllColorsUseCase = new FindAllColorsUseCase(colorRepository);

    const createFlavorUseCase = new CreateFlavorUseCase(flavorRepository);
    const findAllFlavorsUseCase = new FindAllFlavorsUseCase(flavorRepository);
    const findOneFlavorUseCase = new FindOneFlavorUseCase(flavorRepository);
    const updateFlavorUseCase = new UpdateFlavorUseCase(flavorRepository);
    const removeFlavorUseCase = new RemoveFlavorUseCase(flavorRepository);

    const createFillingUseCase = new CreateFillingUseCase(fillingRepository);
    const findAllFillingsUseCase = new FindAllFillingsUseCase(fillingRepository);
    const findOneFillingUseCase = new FindOneFillingUseCase(fillingRepository);
    const updateFillingUseCase = new UpdateFillingUseCase(fillingRepository);
    const removeFillingUseCase = new RemoveFillingUseCase(fillingRepository);

    const createFrostingUseCase = new CreateFrostingUseCase(frostingRepository);
    const findAllFrostingsUseCase = new FindAllFrostingsUseCase(frostingRepository);
    const findOneFrostingUseCase = new FindOneFrostingUseCase(frostingRepository);
    const updateFrostingUseCase = new UpdateFrostingUseCase(frostingRepository);
    const removeFrostingUseCase = new RemoveFrostingUseCase(frostingRepository);

    const createFlowerUseCase = new CreateFlowerUseCase(flowerRepository);
    const findAllFlowersUseCase = new FindAllFlowersUseCase(flowerRepository);
    const findOneFlowerUseCase = new FindOneFlowerUseCase(flowerRepository);
    const updateFlowerUseCase = new UpdateFlowerUseCase(flowerRepository);
    const removeFlowerUseCase = new RemoveFlowerUseCase(flowerRepository);

    const createStyleUseCase = new CreateStyleUseCase(styleRepository);
    const findAllStylesUseCase = new FindAllStylesUseCase(styleRepository);
    const findOneStyleUseCase = new FindOneStyleUseCase(styleRepository);
    const updateStyleUseCase = new UpdateStyleUseCase(styleRepository);
    const removeStyleUseCase = new RemoveStyleUseCase(styleRepository);

    const createBreadTypeUseCase = new CreateBreadTypeUseCase(breadTypeRepository);
    const findAllBreadTypesUseCase = new FindAllBreadTypesUseCase(breadTypeRepository);
    const findOneBreadTypeUseCase = new FindOneBreadTypeUseCase(breadTypeRepository);
    const updateBreadTypeUseCase = new UpdateBreadTypeUseCase(breadTypeRepository);
    const removeBreadTypeUseCase = new RemoveBreadTypeUseCase(breadTypeRepository);

    const createCustomerUseCase = new CreateCustomerUseCase(customerRepository, customerAddressRepository);
    const findAllCustomersUseCase = new FindAllCustomersUseCase(customerRepository);
    const findOneCustomerUseCase = new FindOneCustomerUseCase(customerRepository);
    const updateCustomerUseCase = new UpdateCustomerUseCase(customerRepository, customerAddressRepository);
    const removeCustomerUseCase = new RemoveCustomerUseCase(customerRepository);

    const branchesService = new BranchesService(
      createBranchUseCase,
      findAllBranchesUseCase,
      findOneBranchUseCase,
      updateBranchUseCase,
      removeBranchUseCase,
      createPhoneForBranchUseCase,
      updatePhoneForBranchUseCase
    );

    const usersService = new UsersService(
      registerUserUseCase,
      findAllUsersUseCase,
      findOneUserUseCase,
      updateUserUseCase,
      removeUserUseCase,
      resetPasswordForUserUseCase
    );

    const categoriesService = new CategoriesService(
      createCategoryUseCase,
      findAllCategoriesUseCase,
      findOneCategoryUseCase,
      updateCategoryUseCase,
      removeCategoryUseCase
    );

    const colorsService = new ColorsService(
      createColorUseCase,
      findAllColorsUseCase
    );

    const flavorsService = new FlavorsService(
      createFlavorUseCase,
      findAllFlavorsUseCase,
      findOneFlavorUseCase,
      updateFlavorUseCase,
      removeFlavorUseCase,
    );

    const fillingsService = new FillingsService(
      createFillingUseCase,
      findAllFillingsUseCase,
      findOneFillingUseCase,
      updateFillingUseCase,
      removeFillingUseCase,
    );

    const frostingsService = new FrostingsService(
      createFrostingUseCase,
      findAllFrostingsUseCase,
      findOneFrostingUseCase,
      updateFrostingUseCase,
      removeFrostingUseCase,
    );

    const flowersService = new FlowersService(
      createFlowerUseCase,
      findAllFlowersUseCase,
      findOneFlowerUseCase,
      updateFlowerUseCase,
      removeFlowerUseCase,
    );

    const stylesService = new StylesService(
      createStyleUseCase,
      findAllStylesUseCase,
      findOneStyleUseCase,
      updateStyleUseCase,
      removeStyleUseCase,
    );

    const breadTypesService = new BreadTypesService(
      createBreadTypeUseCase,
      findAllBreadTypesUseCase,
      findOneBreadTypeUseCase,
      updateBreadTypeUseCase,
      removeBreadTypeUseCase,
    );

    const customersService = new CustomersService(
      createCustomerUseCase,
      findAllCustomersUseCase,
      findOneCustomerUseCase,
      updateCustomerUseCase,
      removeCustomerUseCase,
    );

    console.log('✅ Conexión establecida\n');

    console.log('════════════════════════════════════════════════════');
    console.log('         🌱 INICIANDO PROCESO DE SEEDS');
    console.log('════════════════════════════════════════════════════\n');
    // 0. Limpiar base de datos
    if (environment !== 'production') await cleanDatabase(AppDataSource);

    // 1. Usuarios iniciales (necesarios para crear otros registros)
    await seedInitialUsers(usersService, userRepository);

    // 2. Ejecutar el resto del seed solo si dev o staging
    if (environment !== 'development' && environment !== 'staging') return;

    // 3. Sucursales (necesita usuarios)
    await seedBranches(branchesService, userRepository, branchRepository);

    // 4. Usuarios adicionales (necesita sucursales para empleados)
    await seedExtraUsers(usersService, userRepository, branchRepository);

    // 5. Categorías (necesita usuarios)
    await seedCategories(categoriesService, userRepository);

    // 6. Colores (independiente)
    await seedColors(colorsService, colorRepository);

    // 7. Ingredientes y opciones (todos necesitan usuarios)
    await seedFlavors(flavorsService, userRepository, flavorRepository);
    await seedFillings(fillingsService, userRepository, fillingRepository);
    await seedFrostings(frostingsService, userRepository, frostingRepository);
    await seedFlowers(flowersService, userRepository, flowerRepository);
    await seedStyles(stylesService, userRepository, styleRepository);
    await seedBreadTypes(breadTypesService, userRepository, breadTypeRepository);

    // 8. Clientes (necesita usuarios)
    await seedCustomers(customersService, userRepository, customerRepository);

    // 9. Productos (necesita categorías y usuarios)
    // await seedProducts(AppDataSource);

    // 10. Pedidos (necesita clientes, sucursales, productos y usuarios)
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
