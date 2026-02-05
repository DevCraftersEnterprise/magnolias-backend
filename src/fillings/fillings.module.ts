import { Module } from '@nestjs/common';
import { FillingsService } from './fillings.service';
import { FillingsController } from './fillings.controller';
import { Filling } from './entities/filling.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';

@Module({
  controllers: [FillingsController],
  providers: [FillingsService],
  imports: [TypeOrmModule.forFeature([Filling]), CommonModule, CustomJwtModule],
  exports: [TypeOrmModule, FillingsService],
})
export class FillingsModule {}
