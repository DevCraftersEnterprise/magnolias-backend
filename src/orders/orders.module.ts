import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesModule } from '../addresses/addresses.module';
import { BranchesModule } from '../branches/branches.module';
import { ColorsModule } from '../colors/colors.module';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { CustomersModule } from '../customers/customers.module';
import { FlowersModule } from '../flowers/flowers.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { OrderAssignment } from './entities/order-assignment.entity';
import { OrderCancellation } from './entities/order-cancellation.entity';
import { OrderDeliveryAddress } from './entities/order-delivery-address.entity';
import { OrderDetail } from './entities/order-detail.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AssignOrderUseCase } from './usecases/order-assignment/assign-order.usecase';
import { GetAssignmentsUseCase } from './usecases/order-assignment/get-assignments.usecase';

@Module({
  controllers: [OrdersController],
  providers: [
    // Services
    OrdersService,
    // Use cases
    AssignOrderUseCase,
    GetAssignmentsUseCase
  ],
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderDetail,
      OrderCancellation,
      OrderDeliveryAddress,
      OrderAssignment
    ]),
    CommonModule,
    CustomJwtModule,
    AddressesModule,
    BranchesModule,
    ColorsModule,
    FlowersModule,
    CustomersModule,
    ProductsModule,
    UsersModule
  ],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule { }
