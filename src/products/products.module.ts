import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { ProductPicture } from './entities/product-picture.entity';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductUseCase } from './usecases/create-product.usecase';
import { FindAllProductsUseCase } from './usecases/find-all-products.usecase';
import { FindOneProductUseCase } from './usecases/find-one-product.usecase';
import { UpdateProductUseCase } from './usecases/update-product.usecase';
import { UpdateFavoriteProductStatusUseCase } from './usecases/update-favorite-product-status.usecase';
import { RemoveProductUseCase } from './usecases/remove-product.usecase';
import { UploadPicturesForProductUseCase } from './usecases/upload-pictures-for-product.usecase';
import { HideProductPictureUseCase } from './usecases/hide-product-picture.usecase';

@Module({
  controllers: [ProductsController],
  providers: [
    // Services
    ProductsService,
    // Use cases
    CreateProductUseCase,
    FindAllProductsUseCase,
    FindOneProductUseCase,
    UpdateProductUseCase,
    UpdateFavoriteProductStatusUseCase,
    RemoveProductUseCase,
    UploadPicturesForProductUseCase,
    HideProductPictureUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([Product, ProductPicture]),
    CommonModule,
    CustomJwtModule,
    CategoriesModule,
  ],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule { }
