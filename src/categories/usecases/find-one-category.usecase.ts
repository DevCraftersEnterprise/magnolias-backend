import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class FindOneCategoryUseCase {
  private readonly logger = new Logger(FindOneCategoryUseCase.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async execute(term: string): Promise<Category> {
    const whereConditions: FindOptionsWhere<Category> = {};

    if (isUUID(term)) whereConditions.id = term;
    else whereConditions.name = term.toUpperCase();

    const category = await this.categoryRepository.findOne({
      where: whereConditions,
    });

    if (!category) {
      this.logger.warn(`Category with term ${term} not found`);
      throw new NotFoundException(`Category with term ${term} not found`);
    }

    return category;
  }
}
