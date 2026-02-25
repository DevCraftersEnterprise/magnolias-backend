import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { BreadTypesController } from './bread-types.controller';
import { BreadTypesService } from './bread-types.service';
import { BreadType } from './entities/bread-type.entity';
import { CreateBreadTypeUseCase } from './usecases/create-bread-type.usecase';
import { FindAllBreadTypesUseCase } from './usecases/find-all-bread-types.usecase';
import { FindOneBreadTypeUseCase } from './usecases/find-one-bread-type.usecase';
import { RemoveBreadTypeUseCase } from './usecases/remove-bread-type.usecase';
import { UpdateBreadTypeUseCase } from './usecases/update-bread-type.usecase';

@Module({
  controllers: [BreadTypesController],
  providers: [
    // Services
    BreadTypesService,
    // Use Cases
    CreateBreadTypeUseCase,
    FindAllBreadTypesUseCase,
    FindOneBreadTypeUseCase,
    UpdateBreadTypeUseCase,
    RemoveBreadTypeUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([BreadType]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, BreadTypesService],
})
export class BreadTypesModule { }
