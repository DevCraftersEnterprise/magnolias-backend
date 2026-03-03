import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { Frosting } from './entities/frosting.entity';
import { FrostingsController } from './frostings.controller';
import { FrostingsService } from './frostings.service';
import { CreateFrostingUseCase } from './usecases/create-frosting.usecase';
import { FindAllFrostingsUseCase } from './usecases/find-all-frostings.usecase';
import { FindOneFrostingUseCase } from './usecases/find-one-frosting.usecase';
import { RemoveFrostingUseCase } from './usecases/remove-frosting.usecase';
import { UpdateFrostingUseCase } from './usecases/update-frosting.usecase';

@Module({
  controllers: [FrostingsController],
  providers: [
    // Services
    FrostingsService,
    // Use Cases
    CreateFrostingUseCase,
    FindAllFrostingsUseCase,
    FindOneFrostingUseCase,
    UpdateFrostingUseCase,
    RemoveFrostingUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([Frosting]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, FrostingsService],
})
export class FrostingsModule {}
