import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/responses/pagination.response';
import { Category } from '../entities/category.entity';

@Injectable()
export class FindAllCategoriesUseCase {
  private readonly logger = new Logger(FindAllCategoriesUseCase.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async execute(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Category> | Category[]> {
    const { limit, offset } = paginationDto;

    const [categories, total] = await this.categoryRepository.findAndCount({
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
      },
      take: limit,
      skip: offset,
      order: { name: 'ASC' },
    });

    if (limit !== undefined && offset !== undefined) {
      this.logger.log(`Found ${categories.length} categories with pagination`);

      return {
        items: categories,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    this.logger.log(`Found ${categories.length} categories without pagination`);

    return categories;
  }
}
