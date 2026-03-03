import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { Style } from './entities/style.entity';
import { StylesController } from './styles.controller';
import { StylesService } from './styles.service';
import { CreateStyleUseCase } from './usecases/create-style.usecase';
import { FindAllStylesUseCase } from './usecases/find-all-styles.usecase';
import { FindOneStyleUseCase } from './usecases/find-one-style.usecase';
import { RemoveStyleUseCase } from './usecases/remove-style.usecase';
import { UpdateStyleUseCase } from './usecases/update-style.usecase';
@Module({
  controllers: [StylesController],
  providers: [
    // Services
    StylesService,
    // Use cases
    CreateStyleUseCase,
    FindAllStylesUseCase,
    FindOneStyleUseCase,
    UpdateStyleUseCase,
    RemoveStyleUseCase,
  ],
  imports: [TypeOrmModule.forFeature([Style]), CommonModule, CustomJwtModule],
  exports: [TypeOrmModule, StylesService],
})
export class StylesModule {}
