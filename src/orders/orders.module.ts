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
import { OrderFlower } from './entities/order-flower.entity';
import { OrderPayment } from './entities/order-payment.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AssignOrderUseCase } from './usecases/order-assignment/assign-order.usecase';
import { GetAssignmentsUseCase } from './usecases/order-assignment/get-assignments.usecase';
import { UpdateAssignOrderUseCase } from './usecases/order-assignment/update-assign-order.usecase';
import { ChangeOrderStatusUseCase } from './usecases/order/change-order-status.usecase';
import { CreateOrderUseCase } from './usecases/order/create-order.usecase';
import { FindAllOrdersUseCase } from './usecases/order/find-all-orders.usecase';
import { FindOneOrderUseCase } from './usecases/order/find-one-order.usecase';
import { GetOrderStatsUseCase } from './usecases/order/get-order-stats.usecase';
import { SetPickupPersonUseCase } from './usecases/order/set-pickup-person.usecase';
import { UpdateOrderUseCase } from './usecases/order/update-order.usecase';

@Module({
  controllers: [OrdersController],
  providers: [
    // Services
    OrdersService,
    // Use cases
    CreateOrderUseCase,
    SetPickupPersonUseCase,
    FindAllOrdersUseCase,
    FindOneOrderUseCase,
    UpdateOrderUseCase,
    ChangeOrderStatusUseCase,
    GetOrderStatsUseCase,
    AssignOrderUseCase,
    GetAssignmentsUseCase,
    UpdateAssignOrderUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderDetail,
      OrderCancellation,
      OrderDeliveryAddress,
      OrderAssignment,
      OrderFlower,
      OrderPayment,
    ]),
    CommonModule,
    CustomJwtModule,
    AddressesModule,
    BranchesModule,
    ColorsModule,
    FlowersModule,
    CustomersModule,
    ProductsModule,
    UsersModule,
  ],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule { }
