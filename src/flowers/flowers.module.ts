import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { Flower } from './entities/flower.entity';
import { FlowersController } from './flowers.controller';
import { FlowersService } from './flowers.service';
import { CreateFlowerUseCase } from './usecases/create-flower.usecase';
import { FindAllFlowersUseCase } from './usecases/find-all-flowers.usecase';
import { FindOneFlowerUseCase } from './usecases/find-one-flower.usecase';
import { RemoveFlowerUseCase } from './usecases/remove-flower.usecase';
import { UpdateFlowerUseCase } from './usecases/update-flower.usecase';

@Module({
  controllers: [FlowersController],
  providers: [
    // Services
    FlowersService,
    // Use Cases
    CreateFlowerUseCase,
    FindAllFlowersUseCase,
    FindOneFlowerUseCase,
    RemoveFlowerUseCase,
    UpdateFlowerUseCase,
  ],
  imports: [TypeOrmModule.forFeature([Flower]), CommonModule, CustomJwtModule],
  exports: [TypeOrmModule, FlowersService],
})
export class FlowersModule {}
