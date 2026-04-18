import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../../categories/categories.service';
import { User } from '../../users/entities/user.entity';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class UpdateProductUseCase {
  private readonly logger = new Logger(UpdateProductUseCase.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) { }

  async execute(
    id: string,
    updateProductDto: UpdateProductDto,
    user: User,
  ): Promise<Product> {
    const { name, categoryId } = updateProductDto;

    const product = await this.productRepository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!product) {
      this.logger.warn(`Product with ID ${id} not found`);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (name && product.name !== name) {
      const duplicatedProduct = await this.productRepository.findOne({
        where: { name: name.toUpperCase(), category: { id: categoryId } },
      });

      if (duplicatedProduct && duplicatedProduct.id !== id) {
        this.logger.warn(`Product with name ${name} already exists`);
        throw new ConflictException(`Product with name ${name} already exists`);
      }
    }

    this.logger.log(`Updating product with ID ${id}`);

    Object.assign(product, { ...updateProductDto, updatedBy: user });

    if (categoryId && product.category.id !== categoryId) {
      this.logger.log(`Updating product category with ID ${categoryId}`);
      const category = await this.categoriesService.findOne(categoryId);

      Object.assign(product, { category });
    }

    const updatedProduct = await this.productRepository.save(product);

    this.logger.log(`Product updated with ID ${updatedProduct.id}`);

    return updatedProduct;
  }
}
