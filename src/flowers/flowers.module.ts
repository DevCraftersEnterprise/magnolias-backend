import { Module } from '@nestjs/common';
import { FlowersService } from './flowers.service';
import { FlowersController } from './flowers.controller';
import { Flower } from './entities/flower.entity';
import { OrderFlower } from './entities/order-flower.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';

@Module({
  controllers: [FlowersController],
  providers: [FlowersService],
  imports: [
    TypeOrmModule.forFeature([Flower, OrderFlower]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, FlowersService],
})
export class FlowersModule {}
