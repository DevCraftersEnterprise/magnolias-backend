import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';
import { CustomerAddress } from './entities/customer-address.entity';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService],
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerAddress]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, CustomersService],
})
export class CustomersModule {}
