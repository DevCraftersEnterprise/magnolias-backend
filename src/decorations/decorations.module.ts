import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { Decoration } from './entities/decoration.entity';
import { DecorationsController } from './decorations.controller';
import { DecorationsService } from './decorations.service';
import { CreateDecorationUseCase } from './usecases/create-decoration.usecase';
import { FindAllDecorationsUseCase } from './usecases/find-all-decorations.usecase';
import { FindOneDecorationUseCase } from './usecases/find-one-decoration.usecase';
import { RemoveDecorationUseCase } from './usecases/remove-decoration.usecase';
import { UpdateDecorationUseCase } from './usecases/update-decoration.usecase';

@Module({
  controllers: [DecorationsController],
  providers: [
    // Services
    DecorationsService,
    // Use Cases
    CreateDecorationUseCase,
    FindAllDecorationsUseCase,
    FindOneDecorationUseCase,
    UpdateDecorationUseCase,
    RemoveDecorationUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([Decoration]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, DecorationsService],
})
export class DecorationsModule {}
