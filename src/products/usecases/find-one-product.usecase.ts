import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class FindOneProductUseCase {
  private readonly logger = new Logger(FindOneProductUseCase.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async execute(term: string): Promise<Product> {
    const whereConditions: FindOptionsWhere<Product> = {};

    if (isUUID(term)) whereConditions.id = term;
    else whereConditions.name = term.toUpperCase();

    const product = await this.productRepository.findOne({
      where: whereConditions,
    });

    if (!product) {
      this.logger.warn(`Product with term ${term} not found`);
      throw new NotFoundException(`Product with term ${term} not found`);
    }

    return product;
  }

  async favorite(): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { isFavorite: true, pictures: { isActive: true } },
      relations: { pictures: true, category: true },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
        category: {
          id: true,
          name: true,
        },
        pictures: {
          imageUrl: true,
        },
      },
    });

    if (!product) {
      this.logger.warn(`No favorite product found`);
      throw new NotFoundException(`No favorite product found`);
    }

    return product;
  }
}
