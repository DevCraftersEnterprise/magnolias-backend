import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { Flavor } from './entities/flavor.entity';
import { FlavorsController } from './flavors.controller';
import { FlavorsService } from './flavors.service';
import { CreateFlavorUseCase } from './usecases/create-flavor.usecase';
import { FindAllFlavorsUseCase } from './usecases/find-all-flavors.usecase';
import { FindOneFlavorUseCase } from './usecases/find-one-flavor.usecase';
import { RemoveFlavorUseCase } from './usecases/remove-flavor.usecase';
import { UpdateFlavorUseCase } from './usecases/update-flavor.usecase';
@Module({
  controllers: [FlavorsController],
  providers: [
    // Services
    FlavorsService,
    // Use Cases
    CreateFlavorUseCase,
    FindAllFlavorsUseCase,
    FindOneFlavorUseCase,
    UpdateFlavorUseCase,
    RemoveFlavorUseCase,
  ],
  imports: [TypeOrmModule.forFeature([Flavor]), CommonModule, CustomJwtModule],
  exports: [TypeOrmModule, FlavorsService],
})
export class FlavorsModule { }
