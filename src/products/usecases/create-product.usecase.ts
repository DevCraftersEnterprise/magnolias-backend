import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from '../../categories/categories.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class CreateProductUseCase {
  private readonly logger = new Logger(CreateProductUseCase.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) { }

  async execute(
    createProductDto: CreateProductDto,
    user: User,
  ): Promise<Product> {
    const { name, categoryId } = createProductDto;

    const category = await this.categoriesService.findOne(categoryId);

    const duplicatedProduct = await this.productRepository.findOne({
      where: {
        category: { id: categoryId },
        name: name.toUpperCase()
      },
    });

    if (duplicatedProduct) {
      this.logger.log(`Duplicated product name: ${name}`);
      throw new ConflictException(`Product with name ${name} already exists`);
    }

    const product = this.productRepository.create({
      ...createProductDto,
      name: name.toUpperCase(),
      category,
      createdBy: user,
      updatedBy: user,
    });

    const savedProduct = await this.productRepository.save(product);

    this.logger.log(`Product created with ID: ${savedProduct.id}`);

    return savedProduct;
  }
}
