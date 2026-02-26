import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { ColorsController } from './colors.controller';
import { ColorsService } from './colors.service';
import { Color } from './entities/color.entity';
import { CreateColorUseCase } from './usecases/create-color.usecase';
import { FindAllColorsUseCase } from './usecases/find-all-colors.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Color]), CommonModule, CustomJwtModule],
  controllers: [ColorsController],
  providers: [
    // Services
    ColorsService,
    // Use Cases
    CreateColorUseCase,
    FindAllColorsUseCase,
  ],
  exports: [TypeOrmModule, ColorsService],
})
export class ColorsModule { }
