import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../entities/category.entity';

@Injectable()
export class RemoveCategoryUseCase {
  private readonly logger = new Logger(RemoveCategoryUseCase.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async execute(id: string, user: User): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      this.logger.log(`Category not found with ID: ${id}`);
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (!category.isActive) {
      this.logger.log(`Category already removed with ID: ${id}`);
      throw new BadRequestException(
        `Category with ID ${id} is already removed`,
      );
    }

    Object.assign(category, { updatedBy: user, isActive: false });

    await this.categoryRepository.save(category);

    this.logger.log(`Category removed with ID: ${id}`);
  }
}
