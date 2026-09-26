import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { Fruit } from './entities/fruit.entity';
import { FruitsController } from './fruits.controller';
import { FruitsService } from './fruits.service';
import { CreateFruitUseCase } from './usecases/create-fruit.usecase';
import { FindAllFruitsUseCase } from './usecases/find-all-fruits.usecase';
import { FindOneFruitUseCase } from './usecases/find-one-fruit.usecase';
import { RemoveFruitUseCase } from './usecases/remove-fruit.usecase';
import { UpdateFruitUseCase } from './usecases/update-fruit.usecase';

@Module({
  controllers: [FruitsController],
  providers: [
    // Services
    FruitsService,
    // Use Cases
    CreateFruitUseCase,
    FindAllFruitsUseCase,
    FindOneFruitUseCase,
    UpdateFruitUseCase,
    RemoveFruitUseCase,
  ],
  imports: [TypeOrmModule.forFeature([Fruit]), CommonModule, CustomJwtModule],
  exports: [TypeOrmModule, FruitsService],
})
export class FruitsModule {}
