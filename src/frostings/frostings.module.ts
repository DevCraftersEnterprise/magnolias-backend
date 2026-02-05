import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { Frosting } from './entities/frosting.entity';
import { FrostingsController } from './frostings.controller';
import { FrostingsService } from './frostings.service';

@Module({
  controllers: [FrostingsController],
  providers: [FrostingsService],
  imports: [
    TypeOrmModule.forFeature([Frosting]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, FrostingsService],
})
export class FrostingsModule {}
