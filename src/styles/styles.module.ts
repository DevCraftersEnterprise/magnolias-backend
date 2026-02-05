import { Module } from '@nestjs/common';
import { StylesService } from './styles.service';
import { StylesController } from './styles.controller';
import { Style } from './entities/style.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';

@Module({
  controllers: [StylesController],
  providers: [StylesService],
  imports: [TypeOrmModule.forFeature([Style]), CommonModule, CustomJwtModule],
  exports: [TypeOrmModule, StylesService],
})
export class StylesModule {}
