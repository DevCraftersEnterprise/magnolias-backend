import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class UpdateFavoriteProductStatusUseCase {
  private readonly logger = new Logger(UpdateFavoriteProductStatusUseCase.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async execute(id: string, user: User,): Promise<Product> {
    const favorite = await this.productRepository.findOne({
      where: { isFavorite: true },
    });

    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (favorite) {
      Object.assign(favorite, { isFavorite: false, updatedBy: user });
      await this.productRepository.save(favorite);
    }

    if (!product) {
      this.logger.warn(`Product with ID ${id} not found`);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.logger.log(`Updating favorite product with ID: ${id}`);

    Object.assign(product, { isFavorite: true, updatedBy: user });

    const updatedFavorite = await this.productRepository.save(product);

    this.logger.log(`Favorite product updated with ID: ${updatedFavorite.id}`);

    return updatedFavorite;
  }
}
