import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PaginationResponse } from '../../common/responses/pagination.response';
import { ProductsFilterDto } from '../dto/products-filter.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class FindAllProductsUseCase {
  private readonly logger = new Logger(FindAllProductsUseCase.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async execute(
    productsFiltersDto: ProductsFilterDto,
  ): Promise<PaginationResponse<Product> | Product[]> {
    const { name, description, limit, offset } = productsFiltersDto;

    const whereConditions: FindOptionsWhere<Product> = {};

    if (name) whereConditions.name = ILike(`%${name}%`);
    if (description) whereConditions.description = ILike(`%${description}%`);

    const [products, total] = await this.productRepository.findAndCount({
      where: {
        ...whereConditions,
      },
      relations: {
        category: true,
        pictures: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isFavorite: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        category: {
          id: true,
          name: true,
        },
        pictures: {
          id: true,
          imageUrl: true,
          isActive: true
        },
      },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    if (limit !== undefined && offset !== undefined) {
      this.logger.log(`Found ${products.length} products with pagination`);

      return {
        items: products,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    this.logger.log(`Found ${products.length} products without pagination`);

    return products;
  }
}
