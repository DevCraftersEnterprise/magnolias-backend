import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/product.entity';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Products]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}
