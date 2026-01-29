import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesModule } from '../branches/branches.module';
import { ColorsModule } from '../colors/colors.module';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { OrderDetail } from './entities/order-detail.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderCancellation } from './entities/order-cancellation.entity';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    TypeOrmModule.forFeature([Order, OrderDetail, OrderCancellation]),
    CommonModule,
    CustomJwtModule,
    BranchesModule,
    ColorsModule,
  ],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
