import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';
import { CustomerAddress } from './entities/customer-address.entity';
import { CreateCustomerUseCase } from './usecases/create-customer.usecase';
import { FindAllCustomersUseCase } from './usecases/find-all-customers.usecase';
import { FindOneCustomerUseCase } from './usecases/find-one-customer.usecase';
import { UpdateCustomerUseCase } from './usecases/update-customer.usecase';
import { RemoveCustomerUseCase } from './usecases/remove-customer.usecase';

@Module({
  controllers: [CustomersController],
  providers: [
    // Services
    CustomersService,
    // Use Cases
    CreateCustomerUseCase,
    FindAllCustomersUseCase,
    FindOneCustomerUseCase,
    UpdateCustomerUseCase,
    RemoveCustomerUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerAddress]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, CustomersService],
})
export class CustomersModule { }
