import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';
import { CustomJwtModule } from '@/custom-jwt/custom-jwt.module';
import { OrdersModule } from '@/orders/orders.module';

import { BakersController } from '@/bakers/bakers.controller';
import { BakersService } from '@/bakers/bakers.service';
import { Baker } from '@/bakers/entities/baker.entity';
import { OrderAssignment } from '@/bakers/entities/order-assignment.entity';

import { CreateBakerUseCase } from '@/bakers/usecases/baker/create-baker.usecase';
import { FindAllBakersUseCase } from '@/bakers/usecases/baker/find-all-bakers.usecase';
import { FindOneBakerUseCase } from '@/bakers/usecases/baker/find-one-baker.usecase';
import { UpdateBakerUseCase } from '@/bakers/usecases/baker/update-baker.usecase';
import { RemoveBakerUseCase } from '@/bakers/usecases/baker/remove-baker.usecase';
import { AssignOrderUseCase } from '@/bakers/usecases/order-assignment/assign-order.usecase';
import { GetAssignmentsUseCase } from '@/bakers/usecases/order-assignment/get-assignments.usecase';


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
    AssignOrderUseCase,
    GetAssignmentsUseCase,
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
