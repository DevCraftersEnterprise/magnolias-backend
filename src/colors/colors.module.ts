import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { ColorsController } from './colors.controller';
import { ColorsService } from './colors.service';
import { Color } from './entities/color.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Color]), CommonModule, CustomJwtModule],
  controllers: [ColorsController],
  providers: [ColorsService],
  exports: [TypeOrmModule, ColorsService],
})
export class ColorsModule {}
