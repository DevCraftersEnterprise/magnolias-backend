import { Injectable } from '@nestjs/common';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsFilterDto } from './dto/products-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { CreateProductUseCase } from './usecases/create-product.usecase';
import { FindAllProductsUseCase } from './usecases/find-all-products.usecase';
import { FindOneProductUseCase } from './usecases/find-one-product.usecase';
import { HideProductPictureUseCase } from './usecases/hide-product-picture.usecase';
import { RemoveProductUseCase } from './usecases/remove-product.usecase';
import { UpdateFavoriteProductStatusUseCase } from './usecases/update-favorite-product-status.usecase';
import { UpdateProductUseCase } from './usecases/update-product.usecase';
import { UploadPicturesForProductUseCase } from './usecases/upload-pictures-for-product.usecase';

@Injectable()
export class ProductsService {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
    private readonly findOneProductUseCase: FindOneProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly updateFavoriteProductStatusUseCase: UpdateFavoriteProductStatusUseCase,
    private readonly removeProductUseCase: RemoveProductUseCase,
    private readonly uploadPicturesForProductUseCase: UploadPicturesForProductUseCase,
    private readonly hideProductPictureUseCase: HideProductPictureUseCase,
  ) {}

  async createProduct(dto: CreateProductDto, user: User): Promise<Product> {
    return await this.createProductUseCase.execute(dto, user);
  }

  async findProducts(
    filters: ProductsFilterDto,
  ): Promise<PaginationResponse<Product> | Product[]> {
    return await this.findAllProductsUseCase.execute(filters);
  }

  async findProductByTerm(term: string): Promise<Product> {
    return await this.findOneProductUseCase.execute(term);
  }

  async findFavoriteProduct(): Promise<Product> {
    return await this.findOneProductUseCase.favorite();
  }

  async updateProduct(dto: UpdateProductDto, user: User): Promise<Product> {
    return await this.updateProductUseCase.execute(dto, user);
  }

  async updateProductFavoriteStatus(
    dto: UpdateProductDto,
    user: User,
  ): Promise<Product> {
    return await this.updateFavoriteProductStatusUseCase.execute(dto, user);
  }

  async deleteProduct(dto: UpdateProductDto, user: User): Promise<void> {
    return await this.removeProductUseCase.execute(dto, user);
  }

  async uploadProductPicture(
    files: Express.Multer.File[],
    dto: UpdateProductDto,
    user: User,
  ): Promise<Product> {
    return await this.uploadPicturesForProductUseCase.execute(files, dto, user);
  }

  async hideProductPicture(id: string, user: User): Promise<void> {
    return await this.hideProductPictureUseCase.execute(id, user);
  }
}
