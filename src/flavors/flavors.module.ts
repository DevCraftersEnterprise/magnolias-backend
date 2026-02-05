import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { Flavor } from './entities/flavor.entity';
import { FlavorsController } from './flavors.controller';
import { FlavorsService } from './flavors.service';

@Module({
  controllers: [FlavorsController],
  providers: [FlavorsService],
  imports: [TypeOrmModule.forFeature([Flavor]), CommonModule, CustomJwtModule],
  exports: [TypeOrmModule, FlavorsService],
})
export class FlavorsModule {}
