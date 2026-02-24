import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';
import { CustomJwtModule } from '@/custom-jwt/custom-jwt.module';
import { OrdersModule } from '@/orders/orders.module';

import { BakersController } from '@/bakers/bakers.controller';
import { BakersService } from '@/bakers/bakers.service';
import { Baker } from '@/bakers/entities/baker.entity';
import { OrderAssignment } from '@/bakers/entities/order-assignment.entity';

import { CreateBakerUseCase } from '@/bakers/usecases/create-baker.usecase';
import { FindAllBakersUseCase } from '@/bakers/usecases/find-all-bakers.usecase';
import { FindOneBakerUseCase } from '@/bakers/usecases/find-one-baker.usecase';
import { UpdateBakerUseCase } from '@/bakers/usecases/update-baker.usecase';
import { RemoveBakerUseCase } from '@/bakers/usecases/remove-baker.usecase';
@Module({
  controllers: [BakersController],
  providers: [
    // Services
    BakersService,
    // Use Cases
    CreateBakerUseCase,
    FindAllBakersUseCase,
    FindOneBakerUseCase,
    UpdateBakerUseCase,
    RemoveBakerUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([Baker, OrderAssignment]),
    CommonModule,
    CustomJwtModule,
    OrdersModule,
  ],
  exports: [TypeOrmModule, BakersService],
})
export class BakersModule { }
