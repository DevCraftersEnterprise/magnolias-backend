import { Module } from '@nestjs/common';
import { FillingsService } from './fillings.service';
import { FillingsController } from './fillings.controller';
import { Filling } from './entities/filling.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { CreateFillingUseCase } from './usecases/create-filling.usecase';
import { FindAllFillingsUseCase } from './usecases/find-all-fillings.usecase';
import { FindOneFillingUseCase } from './usecases/find-one-filling.usecase';
import { RemoveFillingUseCase } from './usecases/remove-filling.usecase';
import { UpdateFillingUseCase } from './usecases/update-filling.usecase';

@Module({
  controllers: [FillingsController],
  providers: [
    // Services
    FillingsService,
    // Use Cases
    CreateFillingUseCase,
    FindAllFillingsUseCase,
    FindOneFillingUseCase,
    RemoveFillingUseCase,
    UpdateFillingUseCase,
  ],
  imports: [TypeOrmModule.forFeature([Filling]), CommonModule, CustomJwtModule],
  exports: [TypeOrmModule, FillingsService],
})
export class FillingsModule { }
