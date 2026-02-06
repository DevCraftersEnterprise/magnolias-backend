import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { OrdersModule } from '../orders/orders.module';
import { BakersController } from './bakers.controller';
import { BakersService } from './bakers.service';
import { Baker } from './entities/baker.entity';
import { OrderAssignment } from './entities/order-assignment.entity';

@Module({
  controllers: [BakersController],
  providers: [BakersService],
  imports: [
    TypeOrmModule.forFeature([Baker, OrderAssignment]),
    CommonModule,
    CustomJwtModule,
    OrdersModule,
  ],
  exports: [TypeOrmModule, BakersService],
})
export class BakersModule {}
