import { Module } from '@nestjs/common';
import { BreadTypesService } from './bread-types.service';
import { BreadTypesController } from './bread-types.controller';
import { BreadType } from './entities/bread-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';

@Module({
  controllers: [BreadTypesController],
  providers: [BreadTypesService],
  imports: [
    TypeOrmModule.forFeature([BreadType]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, BreadTypesService],
})
export class BreadTypesModule {}
