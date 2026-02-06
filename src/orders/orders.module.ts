import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesModule } from '../branches/branches.module';
import { ColorsModule } from '../colors/colors.module';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { CustomersModule } from '../customers/customers.module';
import { FlowersModule } from '../flowers/flowers.module';
import { ProductsModule } from '../products/products.module';
import { OrderCancellation } from './entities/order-cancellation.entity';
import { OrderDetail } from './entities/order-detail.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    TypeOrmModule.forFeature([Order, OrderDetail, OrderCancellation]),
    CommonModule,
    CustomJwtModule,
    BranchesModule,
    ColorsModule,
    FlowersModule,
    CustomersModule,
    ProductsModule,
  ],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
